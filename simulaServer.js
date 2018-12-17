const express = require("express")
const fs = require("fs")
const app = express()
const path=require('path'); 
let bodyParser = require('body-parser')
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.text({limit:'80mb'}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.text())

var simulateData 
var strimage64 = ''

rootPath = 'D:/image/19/ebb39fb2-acaa-494f-ad30-500f17a3aa27/preview_pic'
preview_pics =  fs.readdirSync(rootPath)
setInterval(()=>{
    let bitmap = fs.readFileSync(rootPath+'/'+ preview_pics[randomNum(0,preview_pics.length-1)]);
    image64  = Buffer(bitmap).toString('base64');
},500)

function randomNum(minNum,maxNum){ 
    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
} 

//上传base64图片
var counter = 0
setInterval(()=>{
        console.log(counter)
        counter = 0
    }, 1000);
app.post('/simulate/postimage',(req,res)=>{
    // console.log(getLocalTime()+' get base64')
    counter ++;
    let data  = req.body
    strimage64 = data['image']
    res.status(200).json({
        status : "done"
    })
})
//接收无人机数据
/**
 * {"aircraftLocation":{"altitude":18.7,"latitude":22.59031,"longitude":113.97999000000002},
 * "gimbal":{"pitch":0.0,"roll":0.0,"yaw":-27.8},
 * "homeLocation":{"latitude":22.59031,"longitude":113.97999000000002}}
 *  */
app.post('/simulate/postdronedata',(req,res)=>{
    let dronestatus = req.body
    dronestatus = JSON.parse(dronestatus)

    dronestatus['aircraftLocation']['latitude'] 
    = getLatDistance(dronestatus['aircraftLocation']['latitude'],
    dronestatus['homeLocation']['latitude'] )

    dronestatus['aircraftLocation']['longitude'] 
    = getLatDistance(dronestatus['aircraftLocation']['longitude'],
    dronestatus['homeLocation']['longitude'] )
    
    let temp1 = dronestatus['aircraftLocation']['longitude']
    let temp2 = dronestatus['aircraftLocation']['latitude'] 
    dronestatus['aircraftLocation']['longitude'] = temp2
    dronestatus['aircraftLocation']['latitude'] = temp1

    simulateData = dronestatus
    res.status(200).json({
        status:'done'
    })
})
//发送无人机数据至模拟器
app.get('/simulate/getstatus',(req,res)=>{
    // console.log(simulateData)
    res.status(200).json(simulateData)
})

//发送模拟器图片至Android端
app.get('/simulate/getimage',(req,res)=>{
    // console.log(getLocalTime()+ 'reach get image command ')
    res.status(200).send(strimage64)
})


//post接口测试
app.post('/simulate/posttest',(req,res)=>{
    console.log(req.body)
    res.status(200).json({
        status : "done"
    })
})

app.use(express.static('public')); 
app.listen(9001, ()=>{
    console.log("server is up")
})

function getLocalTime(){
    var date = new Date();
var year = date.getFullYear();
var month = date.getMonth()+1;
var day = date.getDate();
var hour = date.getHours();
var minute = date.getMinutes();
var second = date.getSeconds();
var milliseconds = date.getMilliseconds();
return month+'/'+day+' '+hour+':'+minute+':'+second+':'+milliseconds

}

function Rad(d){
    return d * Math.PI / 180.0;//经纬度转换成三角函数中度分表形式。
 }
 //计算距离，参数分别为第一点的纬度，经度；第二点的纬度，经度
 function getDistance(lat1,lng1,lat2,lng2){
     var radLat1 = Rad(lat1);
     var radLat2 = Rad(lat2);
     var a = radLat1 - radLat2;
     var  b = Rad(lng1) - Rad(lng2);
     var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
     Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
     s = s *6378.137 ;// EARTH_RADIUS;
    //  s = Math.round(s * 10000) / 10000; //输出为公里
     s = Math.round(s * 100000)/100; //输出为公里
    s=s.toFixed(2);
    s = parseFloat(s)
     return s;
 }

 function getLatDistance(lat1,lat2){
     let z = 1
     if(lat1-lat2<0){
            z= -1
     }else{
        z= 1
     }
     return z*getDistance(lat1,0,lat2,0)
 }
 function getLonDistance(lon1,lon2){
    let z = 1
    if(lat1-lat2<0){
           z= -1
    }else{
       z= 1
    }
    return z*getDistance(0,lon1,0,lon2)
}
