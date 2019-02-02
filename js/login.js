$(function(){

	var _height = $(window).height();
	var _m_top = (_height-290)/2;
	$("#j_from").css("margin-top",_m_top+'px');
	
	$("#j_from").validate({
		rules:{
			username:{
				required:true,
				maxlength:20
			},
			password:{
				required:true,
				maxlength:20
			}
		},
		messages:{
			username:{
				required:"请填写用户名!",
				maxlength:"用户名太长!"
			},
			password:{
				required:"请填写密码!",
				maxlength:"密码太长!"
			}
		},
		submitHandler:function(form){

			var $data = {};
			var username = $("#j_username").val();
			var pwdBytes =Crypto.SHA1($("#j_pwd").val(),{asBytes:true});
			var pwd = Crypto.util.bytesToBase64(pwdBytes);
			$data.userName = username;
			$data.password = pwd;
			if(username == '' || pwd == ''){
				return ;
			}
			$.msg.loading("正在登陆...")
			$.ajax({
				type:"post",
				url:basePath+"web/login",
				data:$data,
				dataType:"json",
				timeout:10000,
				success:function(data){
					console.log(data)
					
					if(data.success){
						location.href="index.html";
					}else{
						$.msg.error(data.errorMsg);
					}
				},
				failure:function(data){
					$.msg.error(data.errorMsg);
				},
			    complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                            　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                             　　　　　this.failure({
                        errorMsg:"登陆超时"     
                   })
                            　　　　}
                        　　         }
			});		
		}
	});
});