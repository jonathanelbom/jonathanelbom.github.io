package ru.kozlovskij.external
{
    import flash.external.ExternalInterface;
    /**
     * @author a.kozlovskij
     * @copy flash.external.ExternalInterface
     */
    public final class ExternalInterfaceExtended
    {
        private static const instance :ExternalInterfaceExtended= new ExternalInterfaceExtended();
        private static var methodName :String;

        /**
         * U can't instanciate this class, because it implements a Singletone pattern.
         * @copy flash.external.ExternalInterface.ExternalInterface()
         */
        public function ExternalInterfaceExtended()
        {
            instance && new ExternalInterface();
            methodName = '__flash__addCallback_' + ExternalInterface.objectID;
        }

        private static function updateJS():void
        {
            const jsFunc :String = 'function(){ ' +
                methodName + ' = __flash__addCallback = function(flashObj, methodName)' +
                '{' +
                '    alert("JS: called overridden __flash__addCallback(" + arguments[0] + ", " + arguments[1] + ")");' +
                '    flashObj[methodName] = ' +
                '     (function(methodName)' +
                '     {' +
                '     return function()' +
                '     {' +
                '     flashObj.CallFunction(\'\' + __flash__argumentsToXML(arguments,0)+ \'\');' +
                '     };' + //dangling semi-colon for IE 6
                '     })(methodName);' + //force re-closure to prevent IE memory leaks
                '};' +
                '}';
            ExternalInterface.call(jsFunc);
        }

        /**
         * Fixed: Mem leaks in native addCallback-js-closure.
         * @copy flash.external.ExternalInterface.addCallback()
         */
        public static function addCallback(functionName :String, closure :Function):void
        {
            //ExternalInterfaceExtended.log('addCallback, functionName:',functionName,', closure:',closure);
            updateJS();
            ExternalInterface.addCallback(functionName, closure);
            //ExternalInterface.call(methodName, functionName);
            //ExternalInterface.call('__flash__addCallback_ext', null, functionName);
        }

        /**
         * @copy flash.external.ExternalInterface.call()
         */
        public static function call(functionName :String, ...parameters :Array):*
        {
            parameters.unshift(functionName);
            return ExternalInterface.call.apply(ExternalInterfaceExtended, parameters);
        }

        /**
         * @copy flash.external.ExternalInterface.available
         */
        public static function get available():Boolean
        {
            return ExternalInterface.available;
        }

        /**
         * @copy flash.external.ExternalInterface.objectID
         */
        public static function get objectID():String
        {
            return ExternalInterface.objectID;
        }

        /**
         * @copy flash.external.ExternalInterface.marshallExceptions
         */
        public static function get marshallExceptions():Boolean
        {
            return ExternalInterface.marshallExceptions;
        }

        public static function set marshallExceptions(value :Boolean):void
        {
            ExternalInterface.marshallExceptions = value;
        }

        public static function log(...args): void {
            var msg:String = args.length > 0 ? args.join(' ') : '';
            msg = '---- ExternalInterfaceExtended > '+msg;
            trace(msg);
            if( ExternalInterfaceExtended.available ) {
                ExternalInterfaceExtended.call( 'console.log', msg );
            }
        }
    }
}