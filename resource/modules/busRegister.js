/**
 * @author Jim.lee
 * @class Emin.BusWindow
 * @extends Ext.app.Module
 */
Emin.BUSREGISTERWindow = Ext.extend(Ext.app.Module, {
    id:'BUSREGISTER-win',
    init : function(){
        this.launcher = {
            text: '车辆服务绑定',
            iconCls:'icon-busRegister',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('BUSREGISTER-win');
		if(!win){
			var pageSize = 20
			var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
			//请求载入数据
			var busRegisterStore = new Ext.data.JsonStore({
				url:basePath+"busRegister/pageStart",
				fields:["id","busId","busServiceId","isValidate","busViewVo","serviceViewVo"],
				root:"t.list",
				totalProperty:"t.allRow"
			})
		    busRegisterStore.load({
		    	params:{
		    		start:0,
		    		limit:pageSize
		    	}
		    })
			//列模型
			var columnModel = new Ext.grid.ColumnModel([
				new Ext.grid.RowNumberer(),
				{header:"车辆",dataIndex:"busViewVo",renderer:function(v,m,r){
					var bus = v.carNo+" "+v.busTypeViewVo.brand+v.busTypeViewVo.version+"("+v.busTypeViewVo.seatNum+"座)"
					return bus
				}},
				{header:"车辆服务",dataIndex:'serviceViewVo',renderer:function(v,m,r){
                    var service = v.name+" 费率："+v.basicsCost+"元"
                    return service
                }},
				{header:"是否有效",dataIndex:"isValidate",xtype:"booleancolumn",trueText:"有效",falseText:"无效",editor:new Ext.form.Checkbox({frame:true})},
				{header:"",dataIndex:"operation",xtype:'uxactioncolumn',items:[{
				    text:"删除",
                    iconCls:"icon-remove",
                    tooltip:"删除服务绑定关系",
                    validRecord:false,
                    scope:this,
                    handler:function(grid,rowIndex,columnIndex){
                    	var record = grid.getStore().getAt(rowIndex)
                    	Ext.Msg.confirm("提示","是否删除此车辆服务绑定信息?",function(b){
                    	   if(b=="yes"){
                    	   	   Ext.Msg.wait("正在删除...","请稍候")
                    	   	   Ext.Ajax.request({
                    	   	   	   url:basePath+"busRegister/delete",
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
			
            var busStore = new Ext.data.JsonStore({
                url:basePath+"bus/pageStart",
                fields:["id","carNo","status","busTypeId"],
                root:"t.list",
                totalProperty:"t.allRow"
            })
            var busServiceStore = new Ext.data.JsonStore({
                url:basePath+"busRegister/busQueryAbleService",               
                fields:["id","name","isActive","serviceFee","businessCode","basicsCost"],
                root:"t"               
            }) 
             var statusObj = {
                "0":"未激活",
                "1":"未使用",
                "2":"已经使用",
                "3":"异常",
                "4":"异常",
                "-1":"报废"
            }
            var busSm = new Ext.grid.CheckboxSelectionModel({
            	singleSelect:true,
            	header:" ",
            	listeners:{
            		rowselect:function(sm,index){
            			var record = busStore.getAt(index)            		
            			busServiceStore.load({
            				params:{
            					busId:record.data.id
            				}
            			})
            		}
            	}
            })
            var busCm = new Ext.grid.ColumnModel([
                busSm,
                {header:"车牌号",dataIndex:"carNo"},
                {header:"车辆状态",dataIndex:"status",renderer:function(v){
                	return statusObj[v]
                }}
            ])
            var busServiceSm = new Ext.grid.CheckboxSelectionModel({
                singleSelect:true
            })
            var busServiceCm = new Ext.grid.ColumnModel([
                busServiceSm,
                {header:"服务名称",dataIndex:"name"},
                {header:"费率",dataIndex:"basicsCost",renderer:function(v,metadata,record,rowIndex,columnIndex,store){
                     return v+"元";
                }}
            ])
            var busGrid = new Ext.grid.GridPanel({
                fieldLabel:"车辆",
                store:busStore,
                cm:busCm,      
                height:190,
                sm:busSm,
                enableHdMenu:false,                
                tbar:["车牌:",{
                    xtype:"textfield",
                    width:120
                },{
                    iconCls:"icon-search",
                    text:"查询",
                    handler:function(){
                        var carNo = busGrid.getTopToolbar().items.itemAt(1).getValue()
                        busStore.baseParams = {
                            "like#carNo":carNo
                        }
                        busStore.load({
                        	params:{
                        		start:0,
                        		limit:pageSize
                        	}
                        })
                    }
                }],               
                viewConfig:{
                    forceFit:true
                },
                bbar:new Ext.PagingToolbar({
                    pageSize:pageSize,
                    store:busStore,
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
            var busServiceGrid = new Ext.grid.GridPanel({
                xtype:"grid",                   
                fieldLabel:"服务类型",
                store:busServiceStore,
                cm:busServiceCm,            
                height:190,
                enableHdMenu:false,                    
                sm:busServiceSm,
                viewConfig:{
                    forceFit:true
                },
                bbar:new Ext.PagingToolbar({
                    pageSize:pageSize,
                    store:busServiceStore,
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
			var busRegisterField = new Ext.form.FieldSet({
				 defaults:{
				 	anchor:"90%"				 	
				 },	
				 layout:"form",				
				 labelAlign:"right",
				 labelWidth:65,
				 items:[busGrid,busServiceGrid]
			})
			var busRegisterForm = new Ext.FormPanel({
				layout:"fit",
				frame:true,
				items:[busRegisterField]
			})
			var busRegisterWin = new Ext.Window({
				manager:wg,
				layout:"fit",
				items:[busRegisterForm],
				closeAction:"hide",
				title:"添加车辆类型",
				constrainHeader:true,
				width:600,
				height:550,
				modal:true,
				listeners:{
					show:function(){
						busStore.load({
							params:{
								start:0,
								limit:pageSize
							}
						})
					},
					hide:function(){
						busRegisterForm.getForm().reset()
						busStore.baseParams = {}
						busGrid.getTopToolbar().items.itemAt(1).reset()
					}
				},
				buttonAlign:"center",
				buttons:[{
					text:"保存",
					iconCls:"icon-save",
					handler:function(){
						var busRecord = busSm.getSelected()
						if(busRecord==null){
							messageWindow({
								message:"请选择车辆"
							})
							return
						}
						var serviceRecord = busServiceSm.getSelected()
						if(serviceRecord==null){
                            messageWindow({
                                message:"请选择车辆服务"
                            })
                            return
                        }
                        var busId = busRecord.data.id
                        var serviceId = serviceRecord.data.id
                        Ext.Msg.wait("正在保存...","请稍候")
                        Ext.Ajax.request({
                        	url:basePath+"busRegister/insert",
                        	method:"post",
                        	params:{
                        		busId:busId,
                        		busServiceId:serviceId,
								isValidate:true
                        	},
                        	success:function(response,request){
                        		Ext.Msg.hide()
                        		var data = Ext.decode(response.responseText)
                        		if(data.success){
                        		  busRegisterStore.load({
                        		  	params:{
                        		  		start:0,
                        		  		limit:pageSize
                        		  	}
                        		  })
                        		  busRegisterWin.hide()
                        		}else{
                        			messageWindow({
                                       message:data.errorMsg
                                    })
                        		}
                        	},
                        	failure:function(){
                        		Ext.Msg.hide()
                        		messageWindow({
                                    message:"保存失败"
                                })
                        	}
                        })
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
			    	anchor:"90%",
			    	xtype:'textfield'
			    },
			    labelAlign:'right',
			    labelWidth:65,
			    items:[{
			    	fieldLabel:"车牌号",
			    	name:"like#bus.carNo"
			    },{
                    fieldLabel:"品牌",
                    name:"like#bus.busType.brand"
                },{
                    fieldLabel:"型号",
                    name:"like#bus.busType.version"
                },{
                    fieldLabel:"服务名称",
                    name:"like#busService.name"
                }],
                buttonAlign:"center",
                buttons:[{
                 	text:"查询",
                 	iconCls:"icon-search",
                 	handler:function(){
                 		if(searchPanel.getForm().isValid()){
                 			var data = searchPanel.getForm().getValues(false)
                 			busRegisterStore.baseParams = data
                 			busRegisterStore.load({
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
                    	busRegisterStore.baseParams = {}
             			busRegisterStore.load({
             			    params:{
             			    	start:0,
             			    	limit:pageSize
             			    }
             			})
                    }
                 }]
			})
			
			//可编辑列表
			var grid = new Ext.grid.EditorGridPanel({
				store:busRegisterStore,
				cm:columnModel,
				clicksToEdit:2,				
				loadMask:true,
				enableColumnMove:false,
				enableHdMenu:false,
				tbar:[{
					text:"添加",
					iconCls:"icon-add",
					handler:function(){
						busRegisterWin.show(this.el)
					}
				}],
				region:"center",
				listeners:{
					afteredit:function(e){
						var record = e.record
						if(record.isValid()){
							var data = Ext.apply({},record.data)
							delete data.busViewVo;
							delete data.serviceViewVo;
							Ext.Ajax.request({
								url:basePath+"busRegister/update",
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
                    pageSize:pageSize,
                    items:["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击“是否有效”列下的单元格可更改状态</div>"],
                    store:busRegisterStore,
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
	                id: 'BUSREGISTER-win',
	              	listeners:{
	              		close:function(){
	              			busRegisterWin.close()
	              		}
					},
	                title:'车辆服务绑定',
	                height:500,
					items:[grid,searchPanel],
	                iconCls: 'icon-busRegister',
	                shim:false,
	                animCollapse:false,
	                constrainHeader:true,
	                layout: 'border'
	            });
	        }
	        win.show();
    }
});