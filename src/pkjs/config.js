module.exports = [  
   {  
      "type":"section",
      "items":[  
         {  
            "type":"heading",
            "defaultValue":"Connection"
         },
         {  
            "type":"input",
            "appKey":"printer_url",
            "label":"Printer IP address"
         },
         {  
            "type":"input",
            "appKey":"octoprint_api",
            "label":"Octoprint API Key"
         },
         {  
            "type":"text",
            "defaultValue":"You can find your API key in Octoprint under Settings -> API -> API Key"
         },
         {
            "type":"input",
            "appKey" : "username",
            "label" : "HTTP Auth Username (if used)"
         },
         {
            "type":"input",
            "appKey" : "password",
            "label" : "HTTP Auth Password (if used)",
            "attributes" : {
                "type" : "password"
            }
         }
      ]
   },
   {  
      "type":"section",
      "items":[  
         {  
            "type":"heading",
            "defaultValue":"Temperature"
         },
         {  
            "type":"select",
            "appKey":"printer_temp",
            "defaultValue":"c",
            "label":"Printer Temp:",
            "options":[  
               {  
                  "label":"Celsius",
                  "value":"c"
               },
               {  
                  "label":"Fahrenheit",
                  "value":"f"
               }
            ]
         },
         {  
            "type":"select",
            "appKey":"weather_temp",
            "defaultValue":"f",
            "label":"Weather Temp:",
            "options":[  
               {  
                  "label":"Celcius",
                  "value":"c"
               },
               {  
                  "label":"Farenheit",
                  "value":"f"
               }
            ]
         }
      ]
   },
   {  
      "type":"submit",
      "defaultValue":"Save"
   }
];