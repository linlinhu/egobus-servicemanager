/*
 * person window
 */
Emin.BUSTYPEWindow = Ext.extend(Ext.app.Module, {
    id:'BUSTYPE-win',
    init : function(){
        this.launcher = {
            text: '车辆类型管理',
            iconCls:'icon-busType',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('BUSTYPE-win');
		if(!win){
			var pageSize = 20
			var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
			//请求载入数据
			var busTypeStore = new Ext.data.JsonStore({
				url:basePath+"busType/pageStart",
				fields:["id","brand","version","seatNum"],
				root:"t.list",
				totalProperty:"t.allRow"
			})
			busTypeStore.load({
				params:{
					start:0,
					limit:pageSize
				}
			})
			//列模型
			var columnModel = new Ext.grid.ColumnModel([
				new Ext.grid.RowNumberer(),
				{header:"品牌",dataIndex:"brand",editor:new Ext.form.TextField({allowBlank:false})},
				{header:"型号",dataIndex:'version',editor:new Ext.form.TextField({allowBlank:false})},
				{header:"座位数",dataIndex:"seatNum",editor:new Ext.form.NumberField({minValue:2,maxValue:200,allowDecimals:false,allowBlank:false}),renderer:function(v,metadata,record,rowIndex,columnIndex,store){
					 return v+"座";
				}},
				{header:"",dataIndex:"operation",xtype:'uxactioncolumn',items:[{
				    text:"删除",
                    iconCls:"icon-remove",
                    tooltip:"删除车辆类型",
                    validRecord:false,
                    scope:this,
                    handler:function(grid,rowIndex,columnIndex){
                    	var record = grid.getStore().getAt(rowIndex)
                    	Ext.Msg.confirm("提示","是否删除此车辆类型?",function(b){
                    	   if(b=="yes"){
                    	   	   Ext.Msg.wait("正在删除...","请稍候")
                    	   	   Ext.Ajax.request({
                    	   	   	   url:basePath+"busType/delete",
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
                    	   	   	   	   }else{
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
				}]}
			])
			var busTypeField = new Ext.form.FieldSet({
				 defaults:{
				 	anchor:"90%",
				 	allowBlank:false
				 },
				
				 layout:"form",
				 labelAlign:"right",
				 labelWidth:65,
				 items:[{
				 	xtype:"textfield",
				 	name:"brand",
				 	fieldLabel:"品牌",
				 	blankText:"请填写品牌"
				 },{
                    xtype:"textfield",
                    name:"version",
                    fieldLabel:"型号",
                    blankText:"请填写型号"
                 },{
                    xtype:"numberfield",
                    name:"seatNum",
                    fieldLabel:"座位数",
                    minValue:2,
                    maxValue:200,
                    allowDecimals:false,
                    blankText:"请填写座位数"
                 }]
			})
			var busTypeForm = new Ext.FormPanel({
				layout:"fit",
				frame:true,
				items:[busTypeField]
			})
			var busTypeWin = new Ext.Window({
				manager:wg,
				layout:"fit",
				items:[busTypeForm],
				closeAction:"hide",
				title:"添加车辆类型",
				constrainHeader:true,
				width:300,
				height:200,
				modal:true,
				listeners:{
					hide:function(){
						busTypeForm.getForm().reset()
					}
				},
				buttonAlign:"center",
				buttons:[{
					text:"保存",
					iconCls:"icon-save",
					handler:function(){
						if(busTypeForm.getForm().isValid()){
							busTypeForm.getForm().submit({
								url:basePath+"busType/insert",
								waitMsg:"正在保存车辆类型...",
								waitTitle:"请稍候",
								success:function(form,action){
									busTypeWin.hide()
									busTypeStore.load({
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
			    	anchor:"90%"
			    },
			    labelAlign:'right',
			    labelWidth:65,
			    items:[{
                    xtype:"textfield",
                    name:"like#brand",
                    fieldLabel:"品牌"
                 },{
                    xtype:"textfield",
                    name:"like#version",
                    fieldLabel:"型号"
                 },{
                    xtype:"numberfield",
                    name:"int@eq#seatNum",
                    fieldLabel:"座位数",                  
                    allowDecimals:false                   
                 }],
                 buttonAlign:"center",
                 buttons:[{
                 	text:"查询",
                 	iconCls:"icon-search",
                 	handler:function(){
                 		if(searchPanel.getForm().isValid()){
                 			var data = searchPanel.getForm().getValues(false)
                 			busTypeStore.baseParams = data
                 			busTypeStore.load({
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
                    	busTypeStore.baseParams = {};
                    	busTypeStore.load({
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
				store:busTypeStore,
				cm:columnModel,
				clicksToEdit:2,
				loadMask:true,
				enableHdMenu:false,
				tbar:[{
					text:"添加",
					iconCls:"icon-add",
					handler:function(){
						busTypeWin.show(this.el)
					}
				}],
				region:"center",
				listeners:{
					afteredit:function(e){
						var record = e.record
						if(record.isValid()){
							var data = record.data
							Ext.Ajax.request({
								url:basePath+"busType/update",
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
				sm:new Ext.grid.RowSelectionModel(),
				viewConfig:{
					forceFit:true,
					emptyText:"没有数据"
				},
				bbar:new Ext.PagingToolbar({
					items:["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击进入编辑</div>"],
                    pageSize:pageSize,
                    store:busTypeStore,
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
	                id: 'BUSTYPE-win',
	              	listeners:{
	              		close:function(){
	              			busTypeWin.close()
	              		}
					},
	                title:'车辆类型管理',
	                height:500,
					items:[grid,searchPanel],
	                iconCls: 'icon-busType',
	                shim:false,
	                animCollapse:false,
	                constrainHeader:true,
	                layout: 'border'
	            });
	        }
	        win.show();
    }
});