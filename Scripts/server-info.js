/**
 * 获取节点的详细信息并展示在软件里
 * 以下命令添加在 [general] 里
 * geo_location_checker=http://ip-api.com/json/?lang=zh-CN, https://raw.githubusercontent.com/shawnwang5/QuantumultX/main/Scripts/server-info.js
 */
if ($response.statusCode != 200) {
    $done(null)
}

const resp = JSON.parse($response.body)
const country = resp['country']
const countryCode = resp['countryCode']
const city = resp['city']
const isp = resp['isp']
const ip = resp['query']
const timezone = resp['timezone']

var title = `${getFlag(countryCode)}${country}-${city}`
var subtitle = `${ip}-${isp}-${timezone}`

$done({ title, subtitle, ip })

function getFlag(countryCode) {
    const flags = new Map([
        ['AC', '🇦🇨'],
        ['AF', '🇦🇫'],
        ['AI', '🇦🇮'],
        ['AL', '🇦🇱'],
        ['AM', '🇦🇲'],
        ['AQ', '🇦🇶'],
        ['AR', '🇦🇷'],
        ['AS', '🇦🇸'],
        ['AT', '🇦🇹'],
        ['AU', '🇦🇺'],
        ['AW', '🇦🇼'],
        ['AX', '🇦🇽'],
        ['AZ', '🇦🇿'],
        ['BB', '🇧🇧'],
        ['BD', '🇧🇩'],
        ['BE', '🇧🇪'],
        ['BF', '🇧🇫'],
        ['BG', '🇧🇬'],
        ['BH', '🇧🇭'],
        ['BI', '🇧🇮'],
        ['BJ', '🇧🇯'],
        ['BM', '🇧🇲'],
        ['BN', '🇧🇳'],
        ['BO', '🇧🇴'],
        ['BR', '🇧🇷'],
        ['BS', '🇧🇸'],
        ['BT', '🇧🇹'],
        ['BV', '🇧🇻'],
        ['BW', '🇧🇼'],
        ['BY', '🇧🇾'],
        ['BZ', '🇧🇿'],
        ['CA', '🇨🇦'],
        ['CF', '🇨🇫'],
        ['CH', '🇨🇭'],
        ['CK', '🇨🇰'],
        ['CL', '🇨🇱'],
        ['CM', '🇨🇲'],
        ['CN', '🇨🇳'],
        ['CO', '🇨🇴'],
        ['CP', '🇨🇵'],
        ['CR', '🇨🇷'],
        ['CU', '🇨🇺'],
        ['CV', '🇨🇻'],
        ['CW', '🇨🇼'],
        ['CX', '🇨🇽'],
        ['CY', '🇨🇾'],
        ['CZ', '🇨🇿'],
        ['DE', '🇩🇪'],
        ['DG', '🇩🇬'],
        ['DJ', '🇩🇯'],
        ['DK', '🇩🇰'],
        ['DM', '🇩🇲'],
        ['DO', '🇩🇴'],
        ['DZ', '🇩🇿'],
        ['EA', '🇪🇦'],
        ['EC', '🇪🇨'],
        ['EE', '🇪🇪'],
        ['EG', '🇪🇬'],
        ['EH', '🇪🇭'],
        ['ER', '🇪🇷'],
        ['ES', '🇪🇸'],
        ['ET', '🇪🇹'],
        ['EU', '🇪🇺'],
        ['FI', '🇫🇮'],
        ['FJ', '🇫🇯'],
        ['FK', '🇫🇰'],
        ['FM', '🇫🇲'],
        ['FO', '🇫🇴'],
        ['FR', '🇫🇷'],
        ['GA', '🇬🇦'],
        ['GB', '🇬🇧'],
        ['HK', '🇭🇰'],
        ['ID', '🇮🇩'],
        ['IE', '🇮🇪'],
        ['IL', '🇮🇱'],
        ['IM', '🇮🇲'],
        ['IN', '🇮🇳'],
        ['IS', '🇮🇸'],
        ['IT', '🇮🇹'],
        ['JP', '🇯🇵'],
        ['KR', '🇰🇷'],
        ['MO', '🇲🇴'],
        ['MX', '🇲🇽'],
        ['MY', '🇲🇾'],
        ['NL', '🇳🇱'],
        ['PH', '🇵🇭'],
        ['RO', '🇷🇴'],
        ['RS', '🇷🇸'],
        ['RU', '🇷🇺'],
        ['RW', '🇷🇼'],
        ['SA', '🇸🇦'],
        ['SB', '🇸🇧'],
        ['SC', '🇸🇨'],
        ['SD', '🇸🇩'],
        ['SE', '🇸🇪'],
        ['SG', '🇸🇬'],
        ['TH', '🇹🇭'],
        ['TN', '🇹🇳'],
        ['TO', '🇹🇴'],
        ['TR', '🇹🇷'],
        ['TV', '🇹🇻'],
        ['TW', '🇨🇳'],
        ['UK', '🇬🇧'],
        ['UM', '🇺🇲'],
        ['US', '🇺🇸'],
        ['UY', '🇺🇾'],
        ['UZ', '🇺🇿'],
        ['VA', '🇻🇦'],
        ['VE', '🇻🇪'],
        ['VG', '🇻🇬'],
        ['VI', '🇻🇮'],
        ['VN', '🇻🇳'],
    ])
    return flags.get(countryCode.toUpperCase()) || ''
}
