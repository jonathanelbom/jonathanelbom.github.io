package
{
	import flash.display.Sprite;
	import flash.events.Event;
	
	import ru.kozlovskij.external.ExternalInterfaceExtended;
	
	public class Main extends Sprite
	{
		public function Main() {
			addEventListener(Event.ADDED_TO_STAGE, onAddedToStage, false, 0, true);
		}
		
		private function callJS( methodName:String, data:* = ''):void {
			var available:Boolean = ExternalInterfaceExtended.available; 
			//log( 'callJS, available:',available,', methodName:',methodName,', data:',data.toString() );
			if ( available ) {
				ExternalInterfaceExtended.call( methodName, data );
			}
		}
		
		private function startSendData():void {
			addEventListener(Event.ENTER_FRAME, sendData, false, 0, true);	
		}
		
		private function stopSendData():void {
			removeEventListener(Event.ENTER_FRAME, sendData);
		}
		
		/**
		 * emulates sending captured mic data one buffer (Float32Array with 2048 values) at a time
		 * this buffer is just white noise. 
		 */
		private function sendData(e:Event):void {
			var a:Array = []
			var l:int = 2048;
			for (var i:int=0; i<l; i++) {
				a.push( 1 - Math.random()*2 );
			}
			callJS('demo.receiveData', a);
			a = [];
		}
		
		private function onAddedToStage(e:Event):void {
			removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			var available:Boolean = ExternalInterfaceExtended.available;
			if ( available ) {
				ExternalInterfaceExtended.addCallback('startSendData', startSendData);
				ExternalInterfaceExtended.addCallback('stopSendData', stopSendData);
			}
			callJS( 'flashReady', available);
		}
		
		private function log(...args): void {
			var msg:String = args.length > 0 ? args.join(' ') : '';
			msg = '---- Main > '+msg;
			if ( ExternalInterfaceExtended.available ) {
				ExternalInterfaceExtended.call( 'console.log', msg )
			} else {
				trace( msg );
			}
		}
	}
}