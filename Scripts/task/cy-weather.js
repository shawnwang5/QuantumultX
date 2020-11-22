/**
 * 彩云天气查询
 * 以下命令放在 [task_local] 里
 * 0 6-23/5 * * * task/cy-weather.js, tag=彩云天气, img-url=https://raw.githubusercontent.com/Orz-3/task/master/caiyun.png, enabled=true
 */
const $ = API('cy-weather', false)
const tokenKey = 'caiyun_weather_token'
// 查询10小时的数据
const hourlySteps = 12

let token = $.read(tokenKey)
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
        log('tokenKey:', token)

        locationInfo = await queryLocation()
        if (locationInfo.lat === 0 && locationInfo.lon === 0) {
            return
        }
        log('locationInfo:', JSON.stringify(locationInfo))

        weatherData = await queryWeather()
        if (!weatherData.result) {
            return
        }

        realtimeWeather()
    } catch (e) {
        console.error(e.message)
    } finally {
        $.done()
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
    let resp = (await $.http.get(myRequest)).body
    resp = JSON.parse(resp)
    if (resp.status === 'success') {
        return resp
    } else {
        $.notify('⚠️warning', 'queryLocation', '位置查询失败')
    }
}

async function queryWeather() {
    const location = {
        latitude: locationInfo.lat,
        longitude: locationInfo.lon,
    }
    const longitude = location.longitude
    const latitude = location.latitude
    const url = `https://api.caiyunapp.com/v2.5/${token}/${longitude},${latitude}/weather.json?lang=zh_CN&hourlysteps=${hourlySteps}&dailysteps=2&alert=true`
    const myRequest = {
        url,
        method: 'GET',
        headers: {
            'User-Agent':
                'ColorfulCloudsPro/5.0.10 (iPhone; iOS 14.0; Scale/3.00)',
        },
        body: JSON.stringify({}),
    }
    let resp = (await $.http.get(myRequest)).body
    resp = JSON.parse(resp)
    if (resp.status === 'ok') {
        return resp
    } else {
        $.delete(tokenKey)
        $.notify('⚠️warning', 'queryWeather', resp.error)
    }
    return {}
}

function realtimeWeather() {
    const data = weatherData.result
    const realtime = data.realtime
    const hourly = data.hourly
    const keyPoint = data.forecast_keypoint
    const airQuality = realtime.air_quality.description.chn

    let hourlyInfoArray = []
    for (let i = 0; i < hourlySteps; i++) {
        const skycon = hourly.skycon[i]
        const date = new Date(skycon.datetime)
        const day = date.getDay()
        const dayStr = day > new Date().getDay() ? '明天' : '今天'
        const nowHour = date.getHours().toString().padStart(2, '0')
        const nextHour = (date.getHours() + 1).toString().padStart(2, '0')
        const curSimpleWeatherInfo = getSimpleWeathInfo(skycon.value)
        const newItem = `${dayStr}${nowHour}-${nextHour}点,${curSimpleWeatherInfo}`
        if (i % 2 === 0) {
            hourlyInfoArray.push(newItem)
        } else {
            let lastItem = hourlyInfoArray.pop()
            lastItem += '; ' + newItem
            if (i === 3) {
                lastItem += '\n'
            }
            hourlyInfoArray.push(lastItem)
        }
    }
    hourlyInfoArray.push('\n' + keyPoint)
    const hourlyInfo = hourlyInfoArray.join('\n')

    const simpleWeatherInfo = getSimpleWeathInfo(realtime.skycon)
    const windInfo = getWindInfo(realtime.wind.speed, realtime.wind.direction)
    const apparentTemperature = realtime.apparent_temperature
    const sunLevel = realtime.life_index.ultraviolet.desc
    const comfortDesc = realtime.life_index.comfort.desc
    const wetPercent = (realtime.humidity * 100).toFixed(0) + '%'

    const title = `${locationInfo.country} ${locationInfo.regionName} ${locationInfo.city}`
    const subtitle = `${simpleWeatherInfo},${realtime.temperature}℃`
    const contentArray = []
    contentArray.push(
        `体感${comfortDesc},${apparentTemperature}℃,湿度${wetPercent},空气质量: ${airQuality}`
    )
    contentArray.push(`${sunLevel}紫外线,${windInfo}`)
    contentArray.push(hourlyInfo)
    log('title:', title)
    log('subtitle:', subtitle)
    log('content:', contentArray.join('\n'))
    $.notify(title, subtitle, contentArray.join('\n'))
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
        CLEAR_DAY: '晴朗',
        CLEAR_NIGHT: '晴朗',
        PARTLY_CLOUDY_DAY: '多云',
        PARTLY_CLOUDY_NIGHT: '多云',
        CLOUDY: '阴天',
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

function log(label, content) {
    console.log(label)
    console.log(content)
    console.log('')
}

/*********************************** API *************************************/
function ENV() {
    const isQX = typeof $task !== 'undefined'
    const isLoon = typeof $loon !== 'undefined'
    const isSurge = typeof $httpClient !== 'undefined' && !isLoon
    const isJSBox = typeof require == 'function' && typeof $jsbox != 'undefined'
    const isNode = typeof require == 'function' && !isJSBox
    const isRequest = typeof $request !== 'undefined'
    const isScriptable = typeof importModule !== 'undefined'
    return { isQX, isLoon, isSurge, isNode, isJSBox, isRequest, isScriptable }
}

function HTTP(baseURL, defaultOptions = {}) {
    const { isQX, isLoon, isSurge, isScriptable, isNode } = ENV()
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH']

    function send(method, options) {
        options = typeof options === 'string' ? { url: options } : options
        options.url = baseURL ? baseURL + options.url : options.url
        options = { ...defaultOptions, ...options }
        const timeout = options.timeout
        const events = {
            ...{
                onRequest: () => {},
                onResponse: resp => resp,
                onTimeout: () => {},
            },
            ...options.events,
        }

        events.onRequest(method, options)

        let worker
        if (isQX) {
            worker = $task.fetch({ method, ...options })
        } else if (isLoon || isSurge || isNode) {
            worker = new Promise((resolve, reject) => {
                const request = isNode ? require('request') : $httpClient
                request[method.toLowerCase()](
                    options,
                    (err, response, body) => {
                        if (err) reject(err)
                        else
                            resolve({
                                statusCode:
                                    response.status || response.statusCode,
                                headers: response.headers,
                                body,
                            })
                    }
                )
            })
        } else if (isScriptable) {
            const request = new Request(options.url)
            request.method = method
            request.headers = options.headers
            request.body = options.body
            worker = new Promise((resolve, reject) => {
                request
                    .loadString()
                    .then(body => {
                        resolve({
                            statusCode: request.response.statusCode,
                            headers: request.response.headers,
                            body,
                        })
                    })
                    .catch(err => reject(err))
            })
        }

        let timeoutid
        const timer = timeout
            ? new Promise((_, reject) => {
                  timeoutid = setTimeout(() => {
                      events.onTimeout()
                      return reject(
                          `${method} URL: ${options.url} exceeds the timeout ${timeout} ms`
                      )
                  }, timeout)
              })
            : null

        return (timer
            ? Promise.race([timer, worker]).then(res => {
                  clearTimeout(timeoutid)
                  return res
              })
            : worker
        ).then(resp => events.onResponse(resp))
    }

    const http = {}
    methods.forEach(
        method =>
            (http[method.toLowerCase()] = options => send(method, options))
    )
    return http
}

function API(name = 'untitled', debug = false) {
    const { isQX, isLoon, isSurge, isNode, isJSBox, isScriptable } = ENV()
    return new (class {
        constructor(name, debug) {
            this.name = name
            this.debug = debug

            this.http = HTTP()
            this.env = ENV()

            this.node = (() => {
                if (isNode) {
                    const fs = require('fs')

                    return {
                        fs,
                    }
                } else {
                    return null
                }
            })()
            this.initCache()

            const delay = (t, v) =>
                new Promise(function (resolve) {
                    setTimeout(resolve.bind(null, v), t)
                })

            Promise.prototype.delay = function (t) {
                return this.then(function (v) {
                    return delay(t, v)
                })
            }
        }
        // persistance

        // initialize cache
        initCache() {
            if (isQX)
                this.cache = JSON.parse($prefs.valueForKey(this.name) || '{}')
            if (isLoon || isSurge)
                this.cache = JSON.parse(
                    $persistentStore.read(this.name) || '{}'
                )

            if (isNode) {
                // create a json for root cache
                let fpath = 'root.json'
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        { flag: 'wx' },
                        err => console.log(err)
                    )
                }
                this.root = {}

                // create a json file with the given name if not exists
                fpath = `${this.name}.json`
                if (!this.node.fs.existsSync(fpath)) {
                    this.node.fs.writeFileSync(
                        fpath,
                        JSON.stringify({}),
                        { flag: 'wx' },
                        err => console.log(err)
                    )
                    this.cache = {}
                } else {
                    this.cache = JSON.parse(
                        this.node.fs.readFileSync(`${this.name}.json`)
                    )
                }
            }
        }

        // store cache
        persistCache() {
            const data = JSON.stringify(this.cache)
            if (isQX) $prefs.setValueForKey(data, this.name)
            if (isLoon || isSurge) $persistentStore.write(data, this.name)
            if (isNode) {
                this.node.fs.writeFileSync(
                    `${this.name}.json`,
                    data,
                    { flag: 'w' },
                    err => console.log(err)
                )
                this.node.fs.writeFileSync(
                    'root.json',
                    JSON.stringify(this.root),
                    { flag: 'w' },
                    err => console.log(err)
                )
            }
        }

        write(data, key) {
            this.log(`SET ${key}`)
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (isSurge || isLoon) {
                    return $persistentStore.write(data, key)
                }
                if (isQX) {
                    return $prefs.setValueForKey(data, key)
                }
                if (isNode) {
                    this.root[key] = data
                }
            } else {
                this.cache[key] = data
            }
            this.persistCache()
        }

        read(key) {
            this.log(`READ ${key}`)
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (isSurge || isLoon) {
                    return $persistentStore.read(key)
                }
                if (isQX) {
                    return $prefs.valueForKey(key)
                }
                if (isNode) {
                    return this.root[key]
                }
            } else {
                return this.cache[key]
            }
        }

        delete(key) {
            this.log(`DELETE ${key}`)
            if (key.indexOf('#') !== -1) {
                key = key.substr(1)
                if (isSurge || isLoon) {
                    return $persistentStore.write(null, key)
                }
                if (isQX) {
                    return $prefs.removeValueForKey(key)
                }
                if (isNode) {
                    delete this.root[key]
                }
            } else {
                delete this.cache[key]
            }
            this.persistCache()
        }

        // notification
        notify(title, subtitle = '', content = '', options = {}) {
            const openURL = options['open-url']
            const mediaURL = options['media-url']

            if (isQX) $notify(title, subtitle, content, options)
            if (isSurge) {
                $notification.post(
                    title,
                    subtitle,
                    content + `${mediaURL ? '\n多媒体:' + mediaURL : ''}`,
                    {
                        url: openURL,
                    }
                )
            }
            if (isLoon) {
                let opts = {}
                if (openURL) opts['openUrl'] = openURL
                if (mediaURL) opts['mediaUrl'] = mediaURL
                if (JSON.stringify(opts) == '{}') {
                    $notification.post(title, subtitle, content)
                } else {
                    $notification.post(title, subtitle, content, opts)
                }
            }
            if (isNode || isScriptable) {
                const content_ =
                    content +
                    (openURL ? `\n点击跳转: ${openURL}` : '') +
                    (mediaURL ? `\n多媒体: ${mediaURL}` : '')
                if (isJSBox) {
                    const push = require('push')
                    push.schedule({
                        title: title,
                        body: (subtitle ? subtitle + '\n' : '') + content_,
                    })
                } else {
                    console.log(`${title}\n${subtitle}\n${content_}\n\n`)
                }
            }
        }

        // other helper functions
        log(msg) {
            if (this.debug) console.log(msg)
        }

        info(msg) {
            console.log(msg)
        }

        error(msg) {
            console.log('ERROR: ' + msg)
        }

        wait(millisec) {
            return new Promise(resolve => setTimeout(resolve, millisec))
        }

        done(value = {}) {
            if (isQX || isLoon || isSurge) {
                $done(value)
            } else if (isNode && !isJSBox) {
                if (typeof $context !== 'undefined') {
                    $context.headers = value.headers
                    $context.statusCode = value.statusCode
                    $context.body = value.body
                }
            }
        }
    })(name, debug)
}
/*****************************************************************************/
