/*
 * person window
 */
Emin.BUSSERVICEWindow = Ext.extend(Ext.app.Module, {
    id:'BUSSERVICE-win',
    init : function(){
        this.launcher = {
            text: '车辆服务管理',
            iconCls:'icon-busService',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('BUSSERVICE-win');
        if(!win){
            var pageSize = 20,
            	wg = new Ext.WindowGroup(),
            	busServiceFormStatus = '',
            	isView = false;
            wg.zseed = 7500;
            //请求载入数据
            var busServiceStore = new Ext.data.JsonStore({
                url:basePath+"busService/query",               
                fields:["id","name","businessCode", 'basicsCost', 'timeLimit', 'milesLimit', 'timeUnit', 'priceUnit', 'isActive', 'serviceRemark'],
                root:"t"               
            })
            var businessCodeStores = new Ext.data.JsonStore({
                url:basePath+"busService/queryBusinessCodes",
                root:"t",
                fields:["k","v"],
                listeners:{
                	load: function() {
                		var p = new Ext.data.Record({'k':'','v':'全部'});
         				this.insert(0, p);
                	}
                }
            });
            var businessCodeStore = new Ext.data.JsonStore({
                url:basePath+"busService/queryBusinessCodes",
                root:"t",
                fields:["k","v"]
            });
           
            businessCodeStores.load({
            	callback:function(){
            		busServiceStore.load();
            		businessCodeStore.load();
            	}
            })
          	
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {header:"服务名称",dataIndex:"name"},
                {header:"是否激活",dataIndex:'isActive',width:80, renderer:function(v){
                     var msg = '';
                     if(v == false){
                     	msg = '否';
                     }else if(v == true) {
                     	msg = '是';
                     }
                     return msg
                }},
                {header:"基础费用",dataIndex:"basicsCost",renderer:function(v){
                    
                     return v+"元";
                }},
                {header:"时间限制",dataIndex:"timeLimit",renderer:function(v){
                    
                     return v+"分";
                }},
                {header:"里程限制",dataIndex:"milesLimit",renderer:function(v){
                    
                     return v+"米";
                }},
                {header:"服务类型",dataIndex:"businessCode",renderer:function(v,m,r){
                     var busCode = businessCodeStores.query("k",v).itemAt(0);
                     return busCode.data.v
                }},
                {
                    header: '操作', dataIndex: 'operations', xtype: 'uxactioncolumn', items: [
                    {
                        text: '详情',
                        iconCls: 'icon-search',
                        tooltip: '查看服务管理',
                        className:'key',
                        handler: function (grid, rowIndex, columnIndex) {
                        	var record = grid.getStore().getAt(rowIndex),
                        		form = busServiceForm.getForm();
                        	isView = true;
                        	busServiceWin.show(this.el);
                        	busServiceWin.setTitle('车辆服务详情');
                        	busServiceForm.getForm().setValues(record.data);
                        	form.findField('name').getEl().dom.readOnly = true;
                        	form.findField('basicsCost').getEl().dom.readOnly = true;
                        	form.findField('timeLimit').getEl().dom.readOnly = true;
                        	form.findField('milesLimit').getEl().dom.readOnly = true;
                        	form.findField('timeUnit').getEl().dom.readOnly = true;
                        	form.findField('priceUnit').getEl().dom.readOnly = true;
                        	form.findField('serviceRemark').getEl().dom.readOnly = true;
                        	Ext.query('.saveBtn')[0].hidden = true;
                        	busServiceFormStatus = '详情';
                        }
                    },{
                        text: '编辑',
                        iconCls: 'icon-edit',
                        tooltip: '编辑服务管理',
                        className:'key',
                        handler: function (grid, rowIndex, columnIndex) {
                        	isView = false;
                        	var record = grid.getStore().getAt(rowIndex),
                        		form = busServiceForm.getForm();
                        	busServiceWin.setTitle('编辑车辆服务');
                        	busServiceWin.show(this.el);
                        	busServiceForm.getForm().setValues(record.data);
                        	form.findField('name').getEl().dom.readOnly = false;
                        	form.findField('basicsCost').getEl().dom.readOnly = false;
                        	form.findField('timeLimit').getEl().dom.readOnly = false;
                        	form.findField('milesLimit').getEl().dom.readOnly = false;
                        	form.findField('timeUnit').getEl().dom.readOnly = false;
                        	form.findField('priceUnit').getEl().dom.readOnly = false;
                        	form.findField('businessCode').getEl().dom.readOnly = false;
                        	form.findField('serviceRemark').getEl().dom.readOnly = false;
                        	Ext.query('.saveBtn')[0].hidden = false;
                        	busServiceFormStatus = '编辑';
                        }
                    }
                ]
                }
                
            ])
            var busServiceField = new Ext.form.FieldSet({
                 defaults:{
                    anchor:"85%",
                    allowBlank:false
                 },
                 anchor:"99%",
                 layout:"form",
                 labelAlign:"right",
                 title:"基础配置",
                 labelWidth:65,
                 items:[{
                    xtype:"textfield",
                    name:"id",
                    fieldLabel:"id",
                    blankText:"id",
                    allowBlank:true,
                    hidden: true, 
					hideLabel:true 
                 },{
                    xtype:"textfield",
                    name:"name",
                    fieldLabel:"服务名称",
                    blankText:"请填服务名称"
                 },{
                    xtype:"combo",
                    cls:'businessCodeSelect',
                    hiddenName:"businessCode",
                    fieldLabel:"服务类型",                   
                    blankText: "请选择服务类型",
                    store:businessCodeStore,
                    listeners:{
                    	expand:function(c){
                    		if(isView){
                    			c.collapse();
                    		}
                    	}
                    },
                    displayField: "v",
                    valueField: "k",
                    triggerAction: "all",
                    mode: "local",
                    editable: false
                 },{
                    xtype:"numberfield",
                    name:"basicsCost",
                    fieldLabel:"基础金额",
                    minValue:0.01,
                    maxValue:1000000,
                    allowDecimals: true,
        			decimalPrecision: 2,
                    blankText:"请填写金额",
                    listeners : {  
                       render : function(obj) {  
                            var font = document.createElement("font");  
                           font.setAttribute("color","black");  
                           var redStar = document.createTextNode(' 元');  
                           font.appendChild(redStar);  
                           obj.el.dom.parentNode.appendChild(font);  
                        }  
                    }
                 },{
                 	xtype:"numberfield",
                    name:"timeLimit",
                    fieldLabel:"时间限制",
                    minValue:1,
                    maxValue:10080,
                    allowDecimals: false,
        			decimalPrecision: 0,
                    blankText:"请输入大于0的整数",
                    listeners : {  
                       render : function(obj) {  
                            var font = document.createElement("font");  
                           font.setAttribute("color","black");  
                           var redStar = document.createTextNode(' 分');  
                           font.appendChild(redStar);  
                           obj.el.dom.parentNode.appendChild(font);  
                        }  
                    }
                 },{
                 	xtype:"numberfield",
                    name:"milesLimit",
                    fieldLabel:"里程限制",
                    maxValue:1000000,
                    minValue:1,
                    allowDecimals: false,
        			decimalPrecision: 0,
                    blankText:"请输入大于0的整数",
                    listeners : {  
                       render : function(obj) {  
                            var font = document.createElement("font");  
                           font.setAttribute("color","black");  
                           var redStar = document.createTextNode(' 米');  
                           font.appendChild(redStar);  
                           obj.el.dom.parentNode.appendChild(font);  
                        }  
                    }
                 }]
            })
            var timeFieldSet = new Ext.form.FieldSet({
            		title:"超时策略",
                 	layout:'column',
                 	//collapsible:true, // 可以实现折叠效果
                 	cls:'extraBox',
                 	anchor:"99%",
                 	items:[{
                 		columnWidth:.5,
                 		layout: 'form',
                 		labelWidth:1,
                 		items:[{
                 			xtype:"numberfield",
                    		name:"priceUnit",
                    		anchor:"80%",
                    		cls:'extra',
                    		blankText:"请填写金额",
                    		allowBlank: false,
                    		minValue:0.01,
                    		maxValue:1000000,
                    		allowDecimals: true,
        					decimalPrecision: 2,
                    		listeners : {  
                               render : function(obj) {  
                                   var font = document.createElement("font");  
                                   font.setAttribute("color","black");  
                                   var redStar = document.createTextNode(' 元  /');  
                                   font.appendChild(redStar);  
                                   obj.el.dom.parentNode.appendChild(font);  
                                }  
                            }
                    		
                 		}]
                 	},{
                 		columnWidth:.5,
                 		layout: 'form',
                 		labelWidth:1,
                 		items:[{
                 			xtype:"numberfield",
                    		name:"timeUnit",
                    		anchor:"80%",
                  			cls:'extra',
                    		blankText:"请填写时间",
                    		allowBlank: false,
                    		minValue:1,
                    		maxValue:525600,
                    		allowDecimals: false,
        					decimalPrecision: 0,
                    		regexText: '请输入大于0的整数',
                    		listeners : {  
                               render : function(obj) {  
                                    var font = document.createElement("font");  
                                   font.setAttribute("color","black");  
                                   var redStar = document.createTextNode(' 分');  
                                   font.appendChild(redStar);  
                                   obj.el.dom.parentNode.appendChild(font);  
                                }  
                            }
	                 	}]
	                 	
	                 },{
	                 	columnWidth:1,
                 		layout: 'form',
                 		labelWidth:1,
                 		items:[{
                 			xtype:"textfield",
                 			name:'tips',
                    		hidden:true,
                    		listeners : {  
                               render : function(obj) {  
                                    var font = document.createElement("font");  
                                   font.setAttribute("color","black");  
                                   var redStar = document.createTextNode('超过时间限制后，按以上方式收取超时费用');  
                                   font.appendChild(redStar);  
                                   obj.el.dom.parentNode.appendChild(font);  
                                }  
                            }
	                 	}]
	                 }]
                 
            })
            var serviceRemarkFieldSet = new Ext.form.FieldSet({
                 defaults:{
                    anchor:"94%",
                    allowBlank:true,
                 },
                 anchor:"99%",
                 layout:"form",
                 labelAlign:"right",
                 title:"服务说明",
                 labelWidth:1,
                 items:[{
                    xtype:"textarea",
                    name:"serviceRemark",
                    minLength:0,
                    maxLength: 500,
                    maxLengthText: '内容不超过500个字符。',
                 }]
            })
            var busServiceForm = new Ext.FormPanel({
                layout:"form",
                frame:true,
                items:[busServiceField,timeFieldSet,serviceRemarkFieldSet]
            })
            var busServiceWin = new Ext.Window({
                manager:wg,
                layout:"fit",
                items:[busServiceForm],
                closeAction:"hide",
                title:"添加车辆服务",
                constrainHeader:true,
                width:350,
                height:480,
                modal:true,
                listeners:{
                    hide:function(){
                        busServiceForm.getForm().reset();
                    }
                },
                buttonAlign:"center",
                buttons:[{
                    text:"保存",
                    name:'saveBtn',
                    cls:'saveBtn',
                    iconCls:"icon-save",
                    handler:function(){
                        if(busServiceForm.getForm().isValid()){
                        	console.log(busServiceForm.getForm().getValues())
                        	var _url = '';
                        	if (busServiceFormStatus == '编辑') {
                        		_url = basePath + 'busService/update';
                        	} else if (busServiceFormStatus == '添加') {
                        		_url = basePath + 'busService/insert';
                        	}
                           	busServiceForm.getForm().submit({
                                url:_url,
                                params:{
                                	isActive:true
                                },
                                waitMsg:"正在保存车辆服务...",
                                waitTitle:"请稍候",
                                success:function(form,action){
                                    busServiceWin.hide()
                                    busServiceStore.load()
                                },
                                failure:function(form,action){
                                	console.log(action.result)
                                    messageWindow({
                                        message:action.result?action.result.errorMsg:"保存失败"
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
                defaults:{
                    anchor:"90%"
                },
                labelAlign:'right',
                labelWidth:65,
                items:[{
                    xtype:"textfield",
                    name:"like#name",
                    fieldLabel:"服务名称"
                 },{
                    xtype:"combo",
                    hiddenName:"int@eq#businessCode",
                    fieldLabel:"服务类型",                
                    store:businessCodeStores,
                    displayField:"v",
                    value:"全部",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                 },{
                    xtype:"combo",
                    hiddenName:"boolean@eq#isActive",
                    fieldLabel:"是否激活",                 
                    store:new Ext.data.JsonStore({
                    	data:[{k:"",v:"全部"},{k:"true",v:"是"},{k:"false",v:"否"}],
                    	fields:["k","v"]
                    }),
                    displayField:"v",
                    value:"",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                 }],
                 buttonAlign:"center",
                 buttons:[{
                    text:"查询",
                    iconCls:"icon-search",
                    handler:function(){
                        if(searchPanel.getForm().isValid()){
                            var data = searchPanel.getForm().getValues(false)
                            if(data["int@eq#businessCode"] == "全部"){
                            	data["int@eq#businessCode"] = '';
                            }
                            console.log(data)
                            busServiceStore.baseParams = data
                            busServiceStore.load()
                        }
                    }
                 },{
                    text:"重置",
                    iconCls:"icon-reset",
                    handler:function(){
                        searchPanel.getForm().reset();
                        busServiceStore.baseParams = {};
                        busServiceStore.load();
                    }
                 }]
            })
            
            //可编辑列表
            var grid = new Ext.grid.EditorGridPanel({
                store:busServiceStore,
                cm:columnModel,
                clicksToEdit:2,
                loadMask:true,
                enableHdMenu:false,
                tbar:[{
                    text:"添加",
                    iconCls:"icon-add",
                    handler:function(){
                    	var form = busServiceForm.getForm();
                        busServiceWin.show(this.el);
                        isView = false;
                        busServiceWin.setTitle('添加车辆服务');
                        form.findField('name').getEl().dom.readOnly = false;
                    	form.findField('basicsCost').getEl().dom.readOnly = false;
                    	form.findField('timeLimit').getEl().dom.readOnly = false;
                    	form.findField('milesLimit').getEl().dom.readOnly = false;
                    	form.findField('timeUnit').getEl().dom.readOnly = false;
                    	form.findField('priceUnit').getEl().dom.readOnly = false;
                    	form.findField('businessCode').getEl().dom.readOnly = false;
                    	Ext.query('.saveBtn')[0].hidden = false;
                        busServiceFormStatus = '添加';
                    }
                }],
                region:"center",
                listeners:{
                    afteredit:function(e){
                        var record = e.record
                        if(record.isValid()){
                            var data = record.data
                            Ext.Ajax.request({
                                url:basePath+"busService/update",
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
                bbar:[{},{
                    iconCls: 'x-tbar-loading',
                    handler: function () {
                    	busServiceStore.load();
                    }
					
				}]
               
            })
            
            //窗口
            win = desktop.createWindow({
                    id: 'BUSSERVICE-win',
                    listeners:{
                        close:function(){
                            busServiceWin.close()
                        }
                    },
                    title:'车辆服务管理',
                    height:500,
                    items:[grid,searchPanel],
                    iconCls: 'icon-busService',
                    shim:false,
                    animCollapse:false,
                    constrainHeader:true,
                    layout: 'border'
                });
            }
            win.show();
    }
});