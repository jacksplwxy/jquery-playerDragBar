!(function ($, window, document, undefined) {
    var PluginName = "playerDragBar"

    function PlayerDragBar(element, options) {
        this.pluginName = PluginName
        this.version = 'v1.0.0'
        this.element = element
        $(this.element).addClass(PluginName)
        var defaults = {
            timeSlot: 1, //单个大刻度时间段长度，单位:分钟
            currentTime: new Date().getTime(), //当前时间，时间戳
            startTime: new Date().getTime() - 60 * 1000, //视频开始时间，时间戳
            endTime: new Date().getTime() + 60 * 1000, //视频结束时间，时间戳
            slotNumber: 8 //展示出来的时间段（大刻度）数量
        }
        this.opts = $.extend({}, defaults, this._isObject(options) ? options : {})
        this.long_timeSlot = 0 //单个大刻度时间段长度
        this.Num_RealTimeSlot = this.opts.slotNumber + 4 //实际的时间段（大刻度）数量
        this.Num_slotLine = 5 //每大刻度下面的时间刻度线数
        this.width_timeScaleContainer = 0 //时间刻度容器的总宽度
        this.width_TimeSlot = 0 //每个大刻度的宽度
        this.long_secondSlot = 0 //每秒钟时间刻度前进距离
        this.long_slotLine = 0 //时间小刻度线的距离
        this.long_restTime = 0 //当前时间到整数之间的时间长度,单位：ms
        this.integerTimestamp = 0 //整数时间戳
        this._init()
    }
    PlayerDragBar.prototype = {
        //拖动开始事件
        EVENT_DRAG_START: "dragstart",
        //拖动结束事件
        EVENT_DRAG_END: "dragend",
        _init: function () {
            var $element = $(this.element)
            this.long_timeSlot = this.opts.timeSlot * 60 * 1000
            this.width_timeScaleContainer = $element.width()
            this.width_TimeSlot = this.width_timeScaleContainer / this.opts.slotNumber
            this.long_secondSlot = this.width_timeScaleContainer / (this.long_timeSlot / 1000 * this.opts.slotNumber)
            this.long_slotLine = this.width_TimeSlot / this.Num_slotLine
            //初始化基础dom
            $element.empty().append(
                "<span class='centerTime'></span>" +
                "<span class='centerTimeLine'></span>" +
                '<div class="timeScaleOuter"><ul class="timeScaleInner"></ul></div>' +
                '<ul class="moveObj"></ul>'
            )
            $element.find('.moveObj').width(this.width_TimeSlot * this.Num_RealTimeSlot)
            this.updateCenterTime(this.opts.currentTime)
            this._addDragEvent()
        },
        //刷新playerDragBar
        _updatePlayerDragBar: function () {
            this._init({
                currentTime: this.currentTime,
                timeSlot: this.timeSlot,
                startTime: this.startTime,
                endTime: this.endTime
            })
        },
        //更新时间段长度
        updateTimeSlot: function (newTimeSlot) {
            this.timeSlot = newTimeSlot
            this._updatePlayerDragBar()
        },
        //刷新容器，尺寸变化时需手动调用
        resize: function () {
            this._updatePlayerDragBar()
            console.log('我是新的resize方法')
        },
        /**
         * @param {string} centerTime：bar中心点的时间 
         */
        updateCenterTime: function (centerTime) {
            var $element = $(this.element)
            this.long_restTime = Math.round((centerTime / 60 / 1000) % this.opts.timeSlot * 60 * 1000)
            this.integerTimestamp = centerTime - this.long_restTime
            //设置中心点时间
            $element.find('.centerTime').text(this._formatDateTime(new Date(centerTime), 'yyyy-MM-dd HH:mm:ss'))
            //获取时间刻度dom
            var liList = ''
            var firstLiTimestamp = Math.round(this.integerTimestamp - (this.Num_RealTimeSlot / 2 - 1) * this.long_timeSlot)
            for (var i = 0; i < this.Num_RealTimeSlot; i++) {
                var lineList = ''
                for (var j = 1; j < this.Num_slotLine + 1; j++) {
                    lineList += '<i style="left:' + this.long_slotLine * j + 'px"></i>'
                }
                var currentLiTimestamp = firstLiTimestamp + i * this.long_timeSlot
                liList +=
                    '<li timestamp="' + currentLiTimestamp + '" style="width:' + this.width_TimeSlot + 'px">' +
                    '<span>' + this._formatDateTime(new Date(currentLiTimestamp), 'HH:mm') + '</span>' +
                    '<div class="slotLine">' + lineList + '</div>' +
                    '</li>'
            }
            $element.find('.moveObj').empty().append(liList)
            //偏移刻度对象，使当前时间居中
            $element.find('.moveObj').css({
                left: -((this.Num_RealTimeSlot - this.opts.slotNumber) / 2 + (this.long_restTime / this.long_timeSlot)) * this.width_TimeSlot + 'px'
            })
            //添加超出视频开始阴影
            var startTimeShadow = '<div class="startTimeShadow"></div>'
            if ($element.find('.startTimeShadow').length == 0) {
                $element.append(startTimeShadow)
            }
            $element.find('.startTimeShadow').css({
                right: $element.find('.centerTimeLine').position().left + (centerTime - this.opts.startTime) / 1000 * this.long_secondSlot + 'px'
            })
            //添加超出视频结束阴影
            var endTimeShadow = '<div class="endTimeShadow"></div>'
            if ($element.find('.endTimeShadow').length == 0) {
                $element.append(endTimeShadow)
            }
            $element.find('.endTimeShadow').css({
                left: $element.find('.centerTimeLine').position().left + (this.opts.endTime - centerTime) / 1000 * this.long_secondSlot + 'px'
            })
        },
        _addDragEvent: function () {
            var $element = $(this.element)
            var $moveObj = $element.find('.moveObj')
            var that = this
            $moveObj.mousedown(function (event) {
                if (typeof that.opts.dragstart === 'function') {
                    $element.one(that.EVENT_DRAG_START, that.opts.dragstart)
                }
                $element.trigger(that.EVENT_DRAG_START)
                var isMove = true
                var mouseDownX = event.pageX //鼠标点下的初始位置
                var splitObjectNumber = 0 //对象被切割次数
                var initObjectLeft = $moveObj.position().left //对象原始的left位置
                var startTimeShadowRight = parseInt($element.find('.startTimeShadow')[0].style.right) //开始阴影原始的right位置
                var endTimeShadowLeft = $element.find('.endTimeShadow').position().left //结束阴影原始的left位置
                var centerTimeStamp = new Date($element.find('.centerTime').text().replace(/-/g, '/')).getTime() //中心时间点的时间戳
                var threshold_max = -((that.Num_RealTimeSlot - that.opts.slotNumber) / 2 - 1) * that.width_TimeSlot //判断切割的阈值
                var threshold_min = -((that.Num_RealTimeSlot - that.opts.slotNumber) / 2 + 1) * that.width_TimeSlot //判断切割的阈值
                var $startTimeShadow = $element.find('.startTimeShadow')
                var $endTimeShadow = $element.find('.endTimeShadow')
                var $centerTime = $element.find('.centerTime')
                var $timeScaleOuter = $('.timeScaleOuter')
                $(document).mousemove(that._throttle(function (event) {
                    if (isMove) {
                        var currentObjectLeft = $moveObj.position().left
                        if (currentObjectLeft >= threshold_max) {
                            splitObjectNumber++
                            $moveObj.find('li:last').clone().prependTo($moveObj)
                            var firstTimestamp = Number($moveObj.find('li:first').attr('timestamp')) - that.Num_RealTimeSlot * that.long_timeSlot
                            $moveObj.find('li:first').attr('timestamp', firstTimestamp)
                            $moveObj.find('li:first').children('span').replaceWith('<span>' + that._formatDateTime(new Date(firstTimestamp), 'HH:mm') + '</span>')
                            $moveObj.find('li:last').remove()
                        } else if (currentObjectLeft <= threshold_min) {
                            splitObjectNumber--
                            $moveObj.find('li:first').clone().appendTo($moveObj)
                            var lastTimestamp = Number($moveObj.find('li:last').attr('timestamp')) + that.Num_RealTimeSlot * that.long_timeSlot
                            $moveObj.find('li:last').attr('timestamp', lastTimestamp)
                            $moveObj.find('li:last').children('span').replaceWith('<span>' + that._formatDateTime(new Date(lastTimestamp), 'HH:mm') + '</span>')
                            $moveObj.find('li:first').remove()
                        }
                        //真实的移动的距离
                        var realMoveLength = event.pageX - mouseDownX
                        $moveObj.css({
                            "left": initObjectLeft + realMoveLength - splitObjectNumber * that.width_TimeSlot + 'px'
                        })
                        $startTimeShadow.css({
                            right: startTimeShadowRight - realMoveLength + 'px'
                        })
                        $endTimeShadow.css({
                            left: endTimeShadowLeft + realMoveLength + 'px'
                        })
                        //更新中心时间点
                        $centerTime.text(that._formatDateTime(new Date(centerTimeStamp - realMoveLength / that.long_secondSlot * 1000), 'yyyy-MM-dd HH:mm:ss'))
                    }
                }, 5)).mouseup(
                    function () {
                        if (isMove) {
                            isMove = false
                            var controlCurrentTime = Number($moveObj.find('li:first').attr('timestamp')) +
                                Math.round(
                                    ($timeScaleOuter.position().left + $timeScaleOuter.width() / 2 -
                                        $moveObj.position().left -
                                        that.width_TimeSlot
                                    ) / that.long_secondSlot * 1000
                                )
                            $centerTime.text(that._formatDateTime(new Date(controlCurrentTime), 'yyyy-MM-dd HH:mm:ss'))
                            if (typeof that.opts.dragend === 'function') {
                                $element.one(that.EVENT_DRAG_END, that.opts.dragend)
                            }
                            $element.trigger(that.EVENT_DRAG_END, controlCurrentTime)
                        }
                    }
                )
            })
        },
        _formatDateTime: function (date, formatStr) {
            var format = formatStr || 'HH:mm:ss'
            var y = date.getFullYear()
            var m = date.getMonth() + 1
            m = m < 10 ? ('0' + m) : m
            var d = date.getDate()
            d = d < 10 ? ('0' + d) : d
            var h = date.getHours()
            h = h < 10 ? ('0' + h) : h
            var minute = date.getMinutes()
            minute = minute < 10 ? ('0' + minute) : minute
            var second = date.getSeconds()
            second = second < 10 ? ('0' + second) : second
            var result = ""
            switch (format) {
                case 'yyyy-MM-dd HH:mm:ss':
                    result = y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second
                    break
                case 'HH:mm:ss':
                    result = h + ':' + minute + ':' + second
                    break
                case 'HH:mm':
                    result = h + ':' + minute
                    break
            }
            return result
        },
        _throttle: function (fn, interval) {
            var _self = fn, //保存需要被延迟执行的函数引用
                timer,
                firstTime = true //是否是第一次调用
            return function () {
                var args = arguments,
                    _me = this
                if (firstTime) {
                    _self.apply(_me, args)
                    return firstTime = false
                }
                if (timer) {
                    return false
                }
                timer = setTimeout(function () {
                    clearTimeout(timer)
                    timer = null
                    _self.apply(_me, args)
                }, interval || 500)
            }
        },
        _isObject: function (value) {
            return Object.prototype.toString.call(value) === '[object Object]';
        }
    }
    var otherPlayerDragBar = $.fn[PluginName]
    $.fn[PluginName] = function (options) {
        var result
        var argsArr = Array.prototype.slice.call(arguments)
        //遍历所有元素
        this.each(function () {
            //单例模式:判断当前元素上是否存在data缓存
            var instance = $.data(this, PluginName)
            if (!instance) {
                //不存在，则new一个实例，并对应元素进行缓存，用于单例判断，后续也可通过$(dom).data()拿到实例
                instance = new PlayerDragBar(this, options)
                $.data(this, PluginName, instance)
            }
            //简化方法调用
            if (typeof options === 'string') {
                var fn = instance[options]
                if ($.isFunction(fn)) {
                    result = fn.apply(instance, argsArr.slice(1))
                    if (result === instance) {
                        result = undefined
                    }
                }
            }
        })
        return result !== undefined ? result : this
    }
    $.fn[PluginName].noConflict = function noConflict(newPluginName) {
        $.fn[PluginName] = otherPlayerDragBar
        PluginName = newPluginName
        $.fn[PluginName] = this
        console.warn('插件名已更换，记得修改css的命名空间!')
    }
})(jQuery, window, document)