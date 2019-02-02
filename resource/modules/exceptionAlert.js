/*
 * person window
 */
Emin.EXCEPTIONALERTWindow = Ext.extend(Ext.app.Module, {
    id:'EXCEPTIONALERT-win',
    init : function(){
        this.launcher = {
            text: '异常管理',
            iconCls:'icon-exceptionAlert',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('EXCEPTIONALERT-win');
		if(!win){
			var pageSize = 20
			var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
			//请求载入数据
			var exceptionStore = new Ext.data.JsonStore({
				url:basePath+"exceptionAlert/pageStart",
				fields:["id","driverMobile","driverName","busNo","x","y","address","exceptionType","exception","status"],
				root:"t.list",
				totalProperty:"t.allRow"
			})
			exceptionStore.load({
				params:{
					start:0,
					limit:pageSize
				}
			})
			
			
			var exceptionTypeStore = new Ext.data.JsonStore({
			     data:[{code:"",text:'全部'},{code:"1",text:'系统'},{code:"2",text:'APP'},{code:"3",text:'车辆'},{code:"4",text:'其他'}],
			     fields:["code","text"]
			})			
			var statusStore = new Ext.data.JsonStore({
                 data:[{code:"0",text:'待接受'},{code:"10",text:'待处理'},{code:"20",text:'处理中'},{code:"30",text:'已处理'},{code:"40",text:'驳回'}],
                 fields:["code","text"]
            })
			var columnModel = new Ext.grid.ColumnModel([
				new Ext.grid.RowNumberer(),
				{header:"上报司机",dataIndex:"driverName",renderer:function(v,m,r){
				    return v+"("+r.data.driverMobile+")"
				}},
				{header:"车牌号",dataIndex:'busNo',renderer:function(v,m,r){
					return v&&v!=""?v:"N/A";
                }},
				{header:"上报地址",dataIndex:"address"},
				{header:"异常类型",dataIndex:"exceptionType",renderer:function(v){
                    var exceptionText = exceptionTypeStore.query("code",v).itemAt(0)
                    return exceptionText.data.text
                }},
                {header:"异常内容",dataIndex:"exception"},
				{header:"状态",dataIndex:"status",renderer:function(v){
					var exceptionText = statusStore.query("code",v).itemAt(0)
				    return exceptionText.data.text
				},editor:new Ext.form.ComboBox({
					store:statusStore,
                    displayField:"text",
                    valueField:"code",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
				})},
				{header:"操作",dataIndex:'operations',xtype:"uxactioncolumn",items:[
				{  
				   text:"查看位置",
				   iconCls:"icon-search",
				   tooltip:"通过地图查看上报的详细位置",
				   handler:function(grid,rowIndex,columnIndex){
				   	    var record = grid.getStore().getAt(rowIndex)
				   	    positionWin.show(this.el)
				   	    var lng = record.data.x
				   	    var lat = record.data.y
				   	    var mapImgSrc = "http://apis.map.qq.com/ws/staticmap/v2/?key=6Q7BZ-OWVHO-ZP4W7-SN5PL-ZGOG6-NNFW6&size=500*400&zoom=15&markers=color:red|"+lat+","+lng
				   	    document.getElementById("positionImg").src=mapImgSrc
				   	   
				   }
				}
				]}
			])
			//6Q7BZ-OWVHO-ZP4W7-SN5PL-ZGOG6-NNFW6
			var positionWin = new Ext.Window({
				manager:wg,
				closeAction:"hide",
				width:500,
				modal:true,
				height:400,
				html:"<img src='' id='positionImg'/>"
			})
			//search 面板
			var searchPanel = new Ext.form.FormPanel({
			    region:"west",
			    width:220,
			    bodyStyle:"padding-top:20px",
			    layout:"form",
			    collapsible:true,
			    frame:true,
			    title:"条件检索",
			    defaults:{
			    	anchor:"90%",
			    	xtype:"textfield"
			    },
			    labelAlign:'right',
			    labelWidth:65,
			    items:[{
			    	fieldLabel:"异常类型",
			    	xtype:"combo",
                    store:exceptionTypeStore,
                    displayField:"text",
                    valueField:"code",
                    value: '',
                    triggerAction:"all",
                    mode:"local",
                    editable:false,
                    hiddenName:"int@eq#exceptionType"
			    },{
                    fieldLabel:"异常内容",                    
                    name:"like#exception"
                },{
                    fieldLabel:"司机",                    
                    name:"like#driverName"
                },{
                    fieldLabel:"手机号",                    
                    name:"like#driverMobile"
                },{
                    fieldLabel:"地址",                    
                    name:"like#address"
                }],
                buttonAlign:"center",
                buttons:[{
                 	text:"查询",
                 	iconCls:"icon-search",
                 	handler:function(){
                 		if(searchPanel.getForm().isValid()){
                 			var data = searchPanel.getForm().getValues(false)
                 			exceptionStore.baseParams = data
                 			exceptionStore.load({
                 			    params:{
                 			    	start:0,
                 			    	limit:pageSize
                 			    }
                 			})
                 		}
                 	}
                },{
                    text:"重置",
                    iconCls:"icon-reset",
                    handler:function(){
                    	searchPanel.getForm().reset();
                    	exceptionStore.baseParams = {};
             			exceptionStore.load({
             			    params:{
             			    	start:0,
             			    	limit:pageSize
             			    }
             			});
                    }
                }]
			})
			
			//可编辑列表
			var grid = new Ext.grid.EditorGridPanel({
				store:exceptionStore,
				cm:columnModel,
				clicksToEdit:2,
				loadMask:true,
				enableHdMenu:false,				
				region:"center",
				listeners:{
					beforeedit:function(e){
						var record = e.record
						return record.data.status!="40"
					},
					afteredit:function(e){
						var record = e.record
						if(record.isValid()){
							var data = Ext.apply({},record.data)
							delete data.busViewVo;
							delete data.driverViewVo;
							if(data.status=='40'){
								Ext.Msg.confirm("提示","是否确认驳回异常信息？ ",function(btn){
								    if(btn=="yes"){
								    	Ext.Ajax.request({
                                            url:basePath+"exceptionAlert/update",
                                            params:data,
                                            success:function(response,request){
                                                var data = Ext.decode(response.responseText)
                                                if(data.success){
                                                    record.commit()
                                                }else{
                                                    record.reject()
                                                    messageWindow({
                                                        message:data.errorMsg
                                                    })
                                                }
                                            },failure:function(){
                                                record.reject()
                                            }
                                        })
								    }else{
								    	record.reject()
								    }
								})
							}else{
								Ext.Ajax.request({
                                    url:basePath+"exceptionAlert/update",
                                    params:data,
                                    success:function(response,request){
                                        var data = Ext.decode(response.responseText)
                                        if(data.success){
                                            record.commit()
                                        }else{
                                            record.reject()
                                            messageWindow({
                                                message:data.errorMsg
                                            })
                                        }
                                    },failure:function(){
                                        record.reject()
                                    }
                                })
							}
							
						}
					}
				},
				sm:new Ext.grid.RowSelectionModel(),
				viewConfig:{
					forceFit:true,
					emptyText:"没有数据"
				},
				bbar:new Ext.PagingToolbar({
					items:["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击进入编辑</div>"],
                    pageSize:pageSize,
                    store:exceptionStore,
                    beforePageText:"第",
                    afterPageText:"页,共{0}页",
                    lastText:"尾页",
                    nextText:"下一页",
                    prevText:"上一页",
                    firstText:"首页",
                    refreshText:"刷新页面",
                    displayInfo:true,
                    displayMsg:'显示第{0}条到{1}条记录,一共{2}条',
                    emptyMsg:"没有记录"
                 })
			})
			
			//窗口
			win = desktop.createWindow({
	                id: 'EXCEPTIONALERT-win',
	              	listeners:{
	              		
					},
	                title:'异常管理',
	                height:500,
					items:[grid,searchPanel],
	                iconCls: 'icon-exceptionAlert',
	                shim:false,
	                animCollapse:false,
	                constrainHeader:true,
	                layout: 'border'
	            });
	        }
	        win.show();
    }
});