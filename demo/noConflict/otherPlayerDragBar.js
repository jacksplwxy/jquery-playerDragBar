!(function ($, window, document, undefined) {
    var PluginName = "playerDragBar"

    function PlayerDragBar(element, options) {
        this.pluginName = PluginName
        this.version = 'v1.0.0'
    }
    PlayerDragBar.prototype = {
        resize: function () {
            console.log('我是已经存在的resize方法')
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
    }
})(jQuery, window, document)