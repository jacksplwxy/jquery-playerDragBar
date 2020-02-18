# jquery-playerDragBar
一款基于jquery的无限拖动视频播放器进度条

## 背景
一般的视频文件只有一定的时间长度，传统的有起终点的进度条可以满足。但是对有实时视频流的录像，需要一款专门的可无限拖动的进度条来适配，该进度就适合这样的场景

## start
```
//引入css 
<link rel="stylesheet" href="jquery.playerDragBar.css">
//引入jquery：该插件依赖jquery
<script src="jquery.js"></script>
//引入插件
<script src="jquery.playerDragBar.js"></script>

//定义个容器
<div class="player-bar"></div>
//初始化
var $playerBar=$('.player-bar')
$playerBar.playerDragBar({ 
    timeSlot: 5,
    dragstart: function () {    //拖拽开始事件
        console.log('开始拖拽')
    }
})
```

## 初始化后获取插件实例
var dragBarInstance = $playerBar.data('playerDragBar');

## 初始化选项配置
* timeSlot    //每段时间间隔，单位：分钟
* currentTime //当前时间，单位：timeStamp
* startTime   //视频开始时间，单位：timeStamp
* endTime //时间结束时间，单位：timeStamp
* slotNumber  //显示的时间段数
* dragstart   //拖拽开始事件
* dragend //拖拽结束事件

## 方法
* updateCenterTime: //刷新当前中心时间
* updateTimeSlot:   //更新每段的时间间隔
* resize:   //刷新容器，通常用在容器尺寸发生变化时调用一次
* noConflict:   //插件命名空间冲突时调用

```
拿到容器jquery对象调用方法：
$('.player-bar').playerDragBar('updateCenterTime', new Date().getTime())

通过playerDragBar实例对象调用方法：
dragBarInstance.updateCenterTime(new Date().getTime())
```

## 事件
* dragstart
* dragend
```
在配置中设置回调：
$playerBar.playerDragBar({ 
    dragend: function (e, time) {
        console.log('拖拽结束')
    }
})

通过容器jquery对象绑定事件回调:
$('.player-bar').on('dragend', function (e, time) {
    console.log('拖拽结束', e, time)
})
```

## 插件冲突：noConflict
$('.player-bar').playerDragBar.noConflict('myPlayerDragBar')

## 插件截图：
<img src="readme/1.gif"  height="400" width="550">