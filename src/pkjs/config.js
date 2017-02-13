module.exports = [{
  "type": "section",
  "items": [
    {
      "type": "heading",
      "defaultValue": "Connection"
    },
    {
      "type": "input",
      "appKey": "printer_url",
      "label": "Printer IP address"
    }, 
    
    {
      "type": "input",
      "appKey": "octoprint_api",
      "label": "Octoprint API Key"
    },
    {
      "type" :"text",
      "defaultValue": "You can find the API key in Octoprint under Settings -> API -> API Key"
    }
  ]
}, {
    type:"submit", defaultValue:"Save"
  }
];