/**
 * 
 * @param {} option
 * 
 *  example
 *  messageWindow({
 *  	position:"tl",
 *  	action:"tl",
 *  	message:"message"
 *  })
 *  or
 *  var option={
 * 	   position:"tl",
 *     action:"tl",
 *     message:"message"
 *  }
 *  messageWindow(option)
 *  
 *  option 配置项说明：
 *  
 *  position:弹窗位置值，值不存在则默认在右下角
 *  
 *  action:弹窗动作特效值：出现及消失的方式
 *  
 *  timeout:弹窗关闭时间默认3秒 为小于1则不关闭
 *  
 *  取值范围：
 *    tl -- top left  	  左上方
 *     t -- top 	      正中上方
 *    tr -- top right 	  右上方
 *     l -- left          正中左方
 *     r -- right  	      正中右方
 *    bl -- bottom left   左下方
 *     b -- bottom        正中下方
 *    br -- bottom right  右下方
 *       
 * 
 */
function messageWindow(option) {
	var x,y;
	if(option.timeout==null){
		option.timeout=3000
	}
	
	switch(option.position){
		case "tl":
			x=10;y=10;
		break;
		case "t" :
			x=(document.body.clientWidth/2)-125;
			y=10;
		;break;
		case "tr":
			x=document.body.clientWidth-250;
			y=10;
		break;
		case "l":
			x=10;
			y=document.body.clientHeight/2-75;
		break;
		case "r":
			x=document.body.clientWidth-250;
			y=document.body.clientHeight/2-75;
		break;
		case "bl":
			x=10;
			y=document.body.clientHeight-180;
		break;
		case "b":
			x=(document.body.clientWidth/2)-125;
			y=document.body.clientHeight-150;
		break;
		case "br":
			x=document.body.clientWidth-250;
			y=document.body.clientHeight-180;
		break;
		default:
			x=document.body.clientWidth-250;
			y=document.body.clientHeight-180;
			option.action="b"
		break;
	}
	if(option.action=="" || option.action==null){
		option.action=option.position
	}
	
	var interval=null;
	var windows = new Ext.Window({
		modal : false,// 不用遮罩层
		width : 250,
		height : 150,
		resizable : false,
		draggable : false,
		closable:false,
		hidden:true,
		autoScroll : true,
		plain : true,
		x : x,
		y : y,
		title : "提示消息",
		html : option.message,
		tools : [{
					id : "close",					
					scope : this,
					handler : function() {
						windows.el.stopFx()
						clearInterval(interval)
						windows.el.ghost(option.action,{
									easing : 'easeOut',
									duration : 1,
									remove : false,
									useDisplay : true,
									callback:function(){
									windows.destroy();
									}
								});

					}
				}],
		shadow : false,			
		listeners:{
			destroy:function(){
				if(interval){
					clearInterval(interval)
				}				
			}
		
		}
		
		})

	windows.show()// 弹窗显示
	
	windows.el.slideIn(option.action, {
				easing : 'easeOut',
				duration : 1,
				callback:function(){
							if(option.timeout>0){
								interval=setInterval(function(){windows.el.ghost(option.action,{
								easing : 'easeOut',
								duration : 1,
								remove : false,
								useDisplay : true,
								callback:function(){
									windows.destroy()
								}
							});},option.timeout)
							}
							
									
				}
			})

}