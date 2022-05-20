
var error1 = new Error("number of arguments should be one");
var error2 = new Error("number of arguments should be two (or three in case of including cookie expiry date)");
var error3 = new Error("this cookie isn't in cookies List");


var cookiesList =[];
function getCookie(cookieName)
{
    if(arguments.length ==1)
    {
        if(hasCookie(cookieName))
        {
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
              var key = cookies[i].split("=")[0].trim();
              var value = cookies[i].split("=")[1];
              cookiesList[key] = value;
            }
            return cookiesList[cookieName];
        }else
        {
            throw error3;
        }
    }else
    {
        throw error1;
    }
}

function setCookie(cookieName,cookieValue,expiryDate)
{
    if(arguments.length ==2 || arguments.length ==3)
    {
        if (arguments.length == 3 && expiryDate) {
          document.cookie = `${cookieName}=${cookieValue};expires=${expiryDate};`;
        } else if (arguments.length == 2 && !expiryDate) {
          document.cookie = `${cookieName}=${cookieValue};`;
        }
    }else
    {
        throw error2;
    }
    
}

function deleteCookie(cookieName)
{
    if(arguments.length ==1)
    {
        if(hasCookie(cookieName))
        {
            var today = new Date();
        today.setFullYear(2000);
        document.cookie = `${cookieName}=;expires=${today};`;
        }else
        {
            throw error3;
        }
    }else
    {
        throw error1;
    }
    
}

var cookiesList2 =[];
function allCookieList()
{
    var cookies = document.cookie.split(";");
    for(var i=0; i<cookies.length; i++)
    {
        var key = cookies[i].split("=")[0].trim();
        var value = cookies[i].split("=")[1];
        cookiesList2[key] = value;
    }
    return cookiesList2;
}

var cookiesList3 =[];
function hasCookie(cookieName)
{
    if(arguments.length ==1)
    {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
          var key = cookies[i].split("=")[0].trim();
          var value = cookies[i].split("=")[1];
          cookiesList2[key] = value;
        }

        var result;
        var flag = 1;
        for (i = 0; i < cookies.length && flag; i++) {
          if (cookieName == key[i]) {
            result = true;
            flag = 0;
          } else {
            result = false;
          }
        }
        return result;
    }else
    {
        throw error1;
    } 
}