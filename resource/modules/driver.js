/*
 * person window
 */
Emin.DRIVERWindow = Ext.extend(Ext.app.Module, {
    id:'DRIVER-win',
    init : function(){
        this.launcher = {
            text: '司机管理',
            iconCls:'icon-driver',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('DRIVER-win');
		if(!win){
			var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
            var pageSize = 20; 
        
			//请求载入数据
			var driverStore = new Ext.data.JsonStore({
				url:basePath+"driver/pageStart",
				fields:["id","idCard","realName","isVal","gender"],
				root:"t.list",
				totalProperty:"t.allRow"
			})
			
    		driverStore.load({
                params:{
                    start:0,
                    limit:pageSize
                }
            })
            
			
			
			var gender = {
				"0":"男",
				"1":"女"
			}
			var driverField = new Ext.form.FieldSet({
                 defaults:{
                    anchor:"90%",
                    allowBlank:false,
                    msgFx:"slide"
                 },
                
                 layout:"form",
                 labelAlign:"right",
                 labelWidth:65,
                 items:[{
                    xtype:"textfield",
                    name:"realName",
                    fieldLabel:"姓名",
                    blankText:"请填写司机姓名",
                    regex:/^[\u4e00-\u9fa5]*$/,
                    regexText:"司机姓名只能输入中文"
                 },{
                    xtype:"textfield",
                    name:"idCard",
                    fieldLabel:"身份证",
                    regex:/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                    regexText:"身份证格式非法",
                    validator:function(v){
                    	var msg = ""                    	
                    	Ext.Ajax.request({
                    		url:basePath+"driver/isExistsCardNo",
                    		async:false,
                    		params:{
                    			idCard:v
                    		},
                    		success:function(response,request){
                    			var data = Ext.decode(response.responseText)
                    			msg = data.t?"身份证号码已经被使用":""
                    		},failure:function(){
                    			msg = "身份证校验失败"
                    		}
                    	})
                    	if(msg!=""){
                    		return msg;
                    	}else{
                    		return true
                    	}
                    },
                    blankText:"请填写司机身份证"
                 }]
            })
            var driverForm = new Ext.FormPanel({
                layout:"fit",
                frame:true,
                items:[driverField]
            })
            var driverWin = new Ext.Window({
                manager:wg,
                layout:"fit",
                items:[driverForm],
                closeAction:"hide",
                title:"添加司机",
                constrainHeader:true,
                width:300,
                height:170,
                modal:true,
                listeners:{
                    hide:function(){
                        driverForm.getForm().reset()
                    }
                },
                buttonAlign:"center",
                buttons:[{
                    text:"保存",
                    iconCls:"icon-save",
                    handler:function(){
                        if(driverForm.getForm().isValid()){
                            driverForm.getForm().submit({
                                url:basePath+"driver/insert",
                                waitMsg:"正在保存司机...",
                                waitTitle:"请稍候",
                                success:function(form,action){
                                    driverWin.hide()
                                    driverStore.baseParams = {};
                                    driverStore.load({
                                        params:{
                                          start:0,
                                          limit:pageSize
                                        }
                                    })
                                },
                                failure:function(form,action){
                                    messageWindow({
                                        message:action.result?"保存失败":action.result.errorMsg
                                    })
                                }
                            })
                        }
                    }
                }]
            })
			//列模型
			var columnModel = new Ext.grid.ColumnModel([
				new Ext.grid.RowNumberer(),				
				{header:"司机姓名",dataIndex:'realName',editor:new Ext.form.TextField({allowBlank:false})},
				{header:"身份证",dataIndex:"idCard",editor:new Ext.form.TextField({
				    allowBlank:false,
				    regex:/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
                    regexText:"身份证格式非法"
				})},
				{header:"性别",dataIndex:"gender",renderer:function(v){
					return gender[v];
				}},
				{header:"是否激活",dataIndex:"isVal",xtype:"booleancolumn",trueText:"是",falseText:"否"},
				{header:"",dataIndex:"operations",xtype:"uxactioncolumn",items:[
				    {
				    	text:"删除",
                        iconCls:"icon-remove",
                        tooltip:"删除车辆",              
                        handler:function(grid,rowIndex,columnIndex){
                           var record = grid.getStore().getAt(rowIndex)
                           Ext.Msg.confirm("提示","是否删除司机："+record.data.realName+")？",function(btn){
                                if(btn=="yes"){
                                	Ext.Msg.wait("正在删除车辆...","请稍候")
                                    Ext.Ajax.request({
                                    	url:basePath+"driver/delete",
                                    	params:{
                                    		id:record.data.id
                                    	},
                                    	success:function(response,request){
                                    		Ext.Msg.hide()
                                    		var data = Ext.decode(response.responseText)
                                    		if(data.success==false){
                                    			messageWindow({
                                                 message:data.errorMsg
                                                })
                                    		}
                                    		else{
                                    			grid.getStore().reload()
                                    		}
                                    	},
                                    	failure:function(){
                                    		Ext.Msg.hide()
                                    		messageWindow({
                                    		     message:"删除失败"
                                    		})
                                    	}
                                    })
                                }
                           })
                        }
				    }
				]}
			])
			
			//search 面板
            var searchPanel = new Ext.form.FormPanel({
                region:"west",
                width:220,
                bodyStyle:"padding-top:20px",
                layout:"form",
                collapsible:true,
                frame:true,
                defaults:{
                    anchor:"90%"
                },
                labelAlign:'right',
                labelWidth:65,
                items:[{
                    xtype:"textfield",
                    name:"like#realName",
                    fieldLabel:"姓名"
                 },{
                    xtype:"textfield",
                    name:"like#idCard",
                    fieldLabel:"身份证"
                 },{
                    xtype:"combo",
                    hiddenName:"int@eq#gender",
                    fieldLabel:"性别",
					store:new Ext.data.JsonStore({
						data:[{text:"全部",value:""},{text:"男",value:"0"},{text:"女",value:"1"}],
						fields:["text","value"]
					}),
					valueField:"value",
					displayField:"text",
					triggerAction:"all",
					value:"",
					mode:"local"
                 },{
                    xtype:"combo",
                    hiddenName:"boolean@eq#isVal",
                    fieldLabel:"是否激活",
					store:new Ext.data.JsonStore({
						data:[{text:"全部",value:""},{text:"是",value:"true"},{text:"否",value:"false"}],
						fields:["text","value"]
					}),
					valueField:"value",
					displayField:"text",
					triggerAction:"all",
					value:"",
					mode:"local"
                 }],
                 buttonAlign:"center",
                 buttons:[{
                    text:"查询",
                    iconCls:"icon-search",
                    handler:function(){
                        if(searchPanel.getForm().isValid()){
                            var data = searchPanel.getForm().getValues(false)                           
                            driverStore.baseParams = data
                            driverStore.load({
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
                        driverStore.baseParams = {};
                        driverStore.load({
                            params:{
                                start:0,
                                limit:pageSize
                            }
                        });
                    }
                 }]
            })
			
			//可编辑面板
			var grid = new Ext.grid.EditorGridPanel({
				store:driverStore,
				cm:columnModel,
				clicksToEdit:2,
				enableHdMenu:false,
				tbar:[{
					text:"添加",
					iconCls:"icon-add",
					handler:function(){
						driverWin.show(this.el)
					}
				}],
				region:"center",
				sm:new Ext.grid.RowSelectionModel(),
				viewConfig:{
					forceFit:true
				},
				listeners:{
                    afteredit:function(e){
                        var record = e.record
                        if(record.isValid()){
                            var data = record.data
                            Ext.Ajax.request({
                                url:basePath+"driver/update",
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
                },
				bbar:new Ext.PagingToolbar({
                    items:["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击进入编辑</div>"],
                    pageSize:pageSize,
                    store:driverStore,
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
	                id: 'DRIVER-win',
	              	listeners:{
	              		close:function(){
                            driverWin.close()                           
                        }
					},
	                title:'司机管理',
	                height:500,
					items:[grid,searchPanel],
	                iconCls: 'icon-driver',
	                shim:false,
	                animCollapse:false,
	                constrainHeader:true,
	                layout: 'border'
	            });
	        }
	        win.show();
    }
});