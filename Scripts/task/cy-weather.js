/**
 * 彩云天气查询
 * 8:00～22:00 之间，每三小时查询一次天气
 * 以下命令放在 [task_local] 里
 * 0 8-22/3 * * * task/cy-weather.js, tag=彩云天气, img-url=https://raw.githubusercontent.com/Orz-3/task/master/caiyun.png, enabled=true
 */
const tokenKey = 'caiyun_weather_token'

let token = $prefs.valueForKey(tokenKey)
let locationInfo = {
    status: 'success',
    country: '中国',
    regionName: '湖北省',
    city: '武汉',
    zip: '',
    lat: 0,
    lon: 0,
    query: '192.168.0.1',
}
let weatherData = {}

!(async () => {
    try {
        if (!token) {
            token = await queryToken()
        }
        if (!token) {
            return
        }
        console.log(`${tokenKey}: ${token}`)

        locationInfo = await queryLocation()
        if (locationInfo.lat === 0 && locationInfo.lon === 0) {
            return
        }
        console.log(`locationInfo: ${JSON.stringify(locationInfo)}`)

        weatherData = await queryWeather()
        if (!weatherData.result) {
            return
        }

        realtimeWeather()
    } catch (e) {
        console.error(e.message)
    } finally {
        $done()
    }
})()

async function queryToken() {
    return '此处请填写你的开发者token值'
}
async function queryLocation() {
    const url = `http://ip-api.com/json/?lang=zh-CN`
    const myRequest = {
        url,
        method: 'GET',
        headers: {
            'User-Agent':
                'ColorfulCloudsPro/5.0.10 (iPhone; iOS 14.0; Scale/3.00)',
        },
        body: JSON.stringify({}),
    }
    let resp = (await $task.fetch(myRequest)).body
    resp = JSON.parse(resp)
    if (resp.status === 'success') {
        return resp
    } else {
        $notify('⚠️warning', 'queryLocation', '位置查询失败')
    }
}

async function queryWeather() {
    const location = {
        latitude: locationInfo.lat,
        longitude: locationInfo.lon,
    }
    const longitude = location.longitude
    const latitude = location.latitude
    const url = `https://api.caiyunapp.com/v2.5/${token}/${longitude},${latitude}/weather.json?lang=zh_CN&hourlysteps=4&dailysteps=2&alert=true`
    const myRequest = {
        url,
        method: 'GET',
        headers: {
            'User-Agent':
                'ColorfulCloudsPro/5.0.10 (iPhone; iOS 14.0; Scale/3.00)',
        },
        body: JSON.stringify({}),
    }
    let resp = (await $task.fetch(myRequest)).body
    resp = JSON.parse(resp)
    if (resp.status === 'ok') {
        return resp
    } else {
        $prefs.removeValueForKey(tokenKey)
        $notify('⚠️warning', 'queryWeather', resp.error)
    }
    return {}
}

function realtimeWeather() {
    const data = weatherData.result
    const realtime = data.realtime
    const hourly = data.hourly

    let hourlyInfoArray = []
    for (let i = 0; i < 4; i++) {
        const skycon = hourly.skycon[i]
        const date = new Date(skycon.datetime)
        const nowHour = (date.getHours() + 1).toString().padStart(2, '0')
        const nextHour = (date.getHours() + 2).toString().padStart(2, '0')
        const curSimpleWeatherInfo = getSimpleWeathInfo(skycon.value)
        const newItem = `${nowHour}点-${nextHour}点,${curSimpleWeatherInfo}`
        if (i % 2 === 0) {
            hourlyInfoArray.push(newItem)
        } else {
            let lastItem = hourlyInfoArray.pop()
            lastItem += '; ' + newItem
            hourlyInfoArray.push(lastItem)
        }
    }

    const hourlyInfo = hourlyInfoArray.join('\n')
    const simpleWeatherInfo = getSimpleWeathInfo(realtime.skycon)
    const airQuality = realtime.air_quality.description.chn
    const windInfo = getWindInfo(realtime.wind.speed, realtime.wind.direction)
    const apparentTemperature = realtime.apparent_temperature
    const sunLevel = realtime.life_index.ultraviolet.desc
    const comfortDesc = realtime.life_index.comfort.desc
    const wetPercent = (realtime.humidity * 100).toFixed(0) + '%'

    const title = `${locationInfo.country} ${locationInfo.regionName} ${locationInfo.city}`
    const subtitle = `${simpleWeatherInfo},${realtime.temperature}℃,空气质量: ${airQuality}`
    const content = `体感${comfortDesc},${apparentTemperature}℃,湿度${wetPercent}
${sunLevel}紫外线,${windInfo}
${hourlyInfo}`
    const extraOpts = {
        'open-url': 'https://tianqi.qq.com/',
        'media-url':
            'https://raw.githubusercontent.com/shawnwang5/QuantumultX/main/Images/weather-big.png',
    }
    $notify(title, subtitle, content, extraOpts)
}

function getWindInfo(speed, direction) {
    let description = ''
    let d_description = ''

    if (speed < 1) {
        return '无风'
    } else if (speed <= 5) {
        description = '1级,微风徐徐'
    } else if (speed <= 11) {
        description = '2级,清风'
    } else if (speed <= 19) {
        description = '3级,树叶摇摆'
    } else if (speed <= 28) {
        description = '4级,树枝摇动'
    } else if (speed <= 38) {
        description = '5级,风力强劲'
    } else if (speed <= 49) {
        description = '6级,风力强劲'
    } else if (speed <= 61) {
        description = '7级,风力超强'
    } else if (speed <= 74) {
        description = '8级,狂风大作'
    } else if (speed <= 88) {
        description = '9级,狂风呼啸'
    } else if (speed <= 102) {
        description = '10级,暴风毁树'
    } else if (speed <= 117) {
        description = '11级,暴风毁树'
    } else if (speed <= 133) {
        description = '12级,飓风'
    } else if (speed <= 149) {
        description = '13级,台风'
    } else if (speed <= 166) {
        description = '14级,强台风'
    } else if (speed <= 183) {
        description = '15级,强台风'
    } else if (speed <= 201) {
        description = '16级,超强台风'
    } else if (speed <= 220) {
        description = '17级,超强台风'
    }

    if (direction >= 348.76 || direction <= 11.25) {
        d_description = '北'
    } else if (direction >= 11.26 && direction <= 33.75) {
        d_description = '北东北'
    } else if (direction >= 33.76 && direction <= 56.25) {
        d_description = '东北'
    } else if (direction >= 56.26 && direction <= 78.75) {
        d_description = '东东北'
    } else if (direction >= 78.76 && direction <= 101.25) {
        d_description = '东'
    } else if (direction >= 101.26 && direction <= 123.75) {
        d_description = '东东南'
    } else if (direction >= 123.76 && direction <= 146.25) {
        d_description = '东南'
    } else if (direction >= 146.26 && direction <= 168.75) {
        d_description = '南东南'
    } else if (direction >= 168.76 && direction <= 191.25) {
        d_description = '南'
    } else if (direction >= 191.26 && direction <= 213.75) {
        d_description = '南西南'
    } else if (direction >= 213.76 && direction <= 236.25) {
        d_description = '西南'
    } else if (direction >= 236.26 && direction <= 258.75) {
        d_description = '西西南'
    } else if (direction >= 258.76 && direction <= 281.25) {
        d_description = '西'
    } else if (direction >= 281.26 && direction <= 303.75) {
        d_description = '西西北'
    } else if (direction >= 303.76 && direction <= 326.25) {
        d_description = '西北'
    } else if (direction >= 326.26 && direction <= 348.75) {
        d_description = '北西北'
    }

    return `${d_description}风${description}`
}

function getSimpleWeathInfo(skycon) {
    const map = {
        CLEAR_DAY: '日间晴朗',
        CLEAR_NIGHT: '夜间晴朗',
        PARTLY_CLOUDY_DAY: '日间多云',
        PARTLY_CLOUDY_NIGHT: '夜间多云',
        CLOUDY: '阴',
        LIGHT_HAZE: '轻度雾霾',
        MODERATE_HAZE: '中度雾霾',
        HEAVY_HAZE: '重度雾霾',
        LIGHT_RAIN: '小雨',
        MODERATE_RAIN: '中雨',
        HEAVY_RAIN: '大雨',
        STORM_RAIN: '暴雨',
        LIGHT_SNOW: '小雪',
        MODERATE_SNOW: '中雪',
        HEAVY_SNOW: '大雪',
        STORM_SNOW: '暴雪',
        FOG: '雾',
        DUST: '浮尘',
        SAND: '沙尘',
        WIND: '大风',
    }
    return map[skycon]
}
