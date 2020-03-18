var slack = {
  postUrl: 'https://slack.com/api/chat.postMessage',
  token: 'XXX',               // Slackのtoken
  channelId: "XXX",           // Slackのチャンネル
  userName: "賞味期限お知らせ"   　// botの名前
}

var todoist = {
  APItoken: 'XXX',        //Todoistのtoken
  project_id: 'XXX' //TodoistのプロジェクトID
}

var vtext;

function myFunctiontodo() {
  var url;
  var result, html;
  var head, body_high, body_mid, body_low;
  
  head = "賞味期限まで７日以内";
  body_high = "";
  body_mid = "";
  body_low = "";
  
  url = "https://todoist.com/API/v8/sync/?token=" + todoist["APItoken"] + "&sync_token=%27*%27&resource_types=[%22items%22]"
  result = UrlFetchApp.fetch(url);
  
  var json = JSON.parse(result.getContentText());
  
  //今日
  dt = new Date();
  dt.setDate(dt.getDate() + 2);
  dt_high = Utilities.formatDate(dt, 'JST', 'yyyy/MM/dd');
  dt.setDate(dt.getDate() + 2);
  dt_mid = Utilities.formatDate(dt, 'JST', 'yyyy/MM/dd');
  dt.setDate(dt.getDate() + 2);
  dt_low = Utilities.formatDate(dt, 'JST', 'yyyy/MM/dd');
  
  var data_array = new Array;
  var j = 0 ;
  
  for (var i in json["items"]){
    var d = new Date(json["items"][i]["due_date_utc"]);
    d = Utilities.formatDate(d, 'JST', 'yyyy/MM/dd')
    
    if (String(json["items"][i]["project_id"]) === todoist["project_id"]){
      if (d <= dt_low ){
        //連想配列として追加
        data_array.push({name:json["items"][i]["content"],day:d});
        j++;
      }
    }
  }
  
  //日付順に並び替え
  data_array.sort(function(a,b){
    if(a.day<b.day) return -1;
    if(a.day>b.day) return 1;
    return 0;
  });
  
  for(i = 0 ; i < data_array.length ; i++ ){
    if (data_array[i]["day"] <= dt_high){
      body_high += "\n" +data_array[i]["name"]+"("+data_array[i]["day"]+")"
    }else if (dt_high < data_array[i]["day"] && data_array[i]["day"] <= dt_mid){
      body_mid += "\n" +data_array[i]["name"]+"("+data_array[i]["day"]+")"
    }else{
      body_low += "\n" +data_array[i]["name"]+"("+data_array[i]["day"]+")"
    }
  }
  
  UrlFetchApp.fetch(slack["postUrl"],edit_text(body_high,body_mid,body_low,head));  //3day
}

//カラーコード
function edit_text(vtext_high,vtext_mid,vtext_low,head){
  var attachments = JSON.stringify([
    {
      "color": "#FF1493",
      "text": vtext_high
    },
    {
      "color": "#FFA500",
      "text": vtext_mid
    },
    {
      "color": "#36a64f",
      "text": vtext_low
    }
  
  ]);

  if(vtext_high + vtext_mid + vtext_low ==""){
    head = "賞味期限まで７日以内はないよ！";
  }
  
  var payload = { 
    "token": slack["token"],
    "channel": slack["channelId"],
    "username": slack["userName"],
    "as_user" : false ,
    "attachments": attachments,
    "icon_emoji": ":todoist:",
    "text": head
  };

  var option = {
    "method" : "POST", //POST送信
    "payload" : payload //POSTデータ
  };
  
  return option
}
