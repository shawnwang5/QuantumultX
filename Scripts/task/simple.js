/**
 * $prefs.setValueForKey(value, key)
 * $prefs.valueForKey(key)
 * $prefs.removeValueForKey
 * $notify(title, subtitle, content, {'open-url': '', 'media-url': ''})
 */
const url = 'https://example.com/'
const method = 'POST'
const headers = { Field: 'test-header-param' }
const data = { info: 'abc' }

const myRequest = {
    url,
    method,
    headers,
    body: JSON.stringify(data),
}

$task.fetch(myRequest).then(
    response => {
        console.log(response.statusCode, response.headers, response.body)
        $notify('Title', 'Subtitle', response.body)
    },
    reason => {
        console.log(reason.error)
    }
)
