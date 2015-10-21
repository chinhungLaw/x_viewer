/**
 * 名称:x_img_viewer
 * 功能:点击图片查看大图插件.兼容IE,Chrome,FF等浏览器
 * 描述:此插件自动适应页面缩放,自动生成样式和DOM节点,只需在父级DOM添加 id="x_img_viewer" 即可使用,并支持显示高清大图(用法详见下文),.
 * 用法: 1.只需在父级DOM添加 id="x_img_viewer" ,本插件便会自动搜索此父级DOM下的全部 img DOM节点.
		 2.如需显示高清图,只需在img DOM节点下添加属性 x_img_viewer_url="{path}" 即可.
 * @author chinhungLaw
 * @Email adamluo2003@qq.com
 * @version 1.0.0
 * @dependencies none
 */
(function(win,doc){
	var tools={
		getBow:function(){
			var Sys = {};
			var ua = navigator.userAgent.toLowerCase();
			var s;
			(s = ua.match(/msie ([\d.]+)/)) ? Sys.ie = s[1] : (s = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = s[1] : (s = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = s[1] : (s = ua.match(/opera.([\d.]+)/)) ? Sys.opera = s[1] : (s = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = s[1] : 0;
			if (Sys.ie &&  Sys.ie=='6.0'  ) return 'IE6';
			else if (Sys.ie &&  Sys.ie=='7.0'  ) return 'IE7';
			else if (Sys.ie &&  Sys.ie=='8.0'  ) return 'IE8';
			else if (Sys.ie &&  Sys.ie=='9.0'  ) return 'IE9';
			else if (Sys.ie &&  Sys.ie=='10.0'  ) return 'IE10';
			else if (Sys.ie &&  Sys.ie=='11.0'  ) return 'IE11';
			else if (Sys.firefox) return '-moz-';
			else if (Sys.chrome) return '-webkit-';
			else if (Sys.opera) return '-o-';
			else if (Sys.safari) return '-webkit-';
			else return '';
		}
		, setCss:function(tar,jData){
			for(var x in jData){
				tar.style[x]=jData[x];
			}
		}
		, startMove:function(obj, json, fn){
			var This=this;
			var iSpeed = 0;
			clearInterval(obj.timer);
			obj.timer=setInterval(function (){
				var bStop=true;
				for(var attr in json){
					var iCur=0;
					if(attr=='opacity'){
						iCur=parseInt(parseFloat(This.getStyle(obj, attr))*100);
					}
					else{
						iCur=parseInt(This.getStyle(obj, attr));
					}
					var iSpeed=(json[attr]-iCur)/8;
					iSpeed=iSpeed>0?Math.ceil(iSpeed):Math.floor(iSpeed);
					if(iCur!=json[attr]){
						bStop=false;
					}
					if(attr=='opacity'){
						obj.style.filter='alpha(opacity:'+(iCur+iSpeed)+')';
						obj.style.opacity=(iCur+iSpeed)/100;
					}
					else{
						obj.style[attr]=iCur+iSpeed+'px';
					}
				}
				if(bStop){
					clearInterval(obj.timer);
					if(fn){
						fn();
					}
				}
			}
			, 30) 
		}
		, getStyle:function(obj, attr){
			if(obj.currentStyle){
				return obj.currentStyle[attr];
			}
			else{
				return getComputedStyle(obj, false)[attr];
			}
		}
	};
	var app={
		init:function(){
			this.headEle=doc.getElementsByTagName("head")[0];
			this.bodyEle=doc.getElementsByTagName("body")[0];
			this.bows=tools.getBow();
			this.creatBaseCss();
			this.createBaseDom();
			this.getBaseData();
			this.addBaseEvent();
			this.getImgUrl();
			this.winPopupRisize();
		}
		, creatBaseCss:function(){
			var css=doc.createElement("style");
			css.type="text/css";
			var cssHtml='';
			css.id='popup_css_x_viewer';
			cssHtml+='#popup_x_viewer{ position:fixed;left:0;top:0;width:100%;height:100%;z-index:999999;overflow:auto;display:none;}';
			cssHtml+='#popup_x_viewer #meng_x_viewer{position:absolute;top:0;left:0;width:100%;height:100%;background:#000;_background:#999;opacity:0.5;filter:alpha(opacity=50);}';
			cssHtml+='#popup_x_viewer #main_x_viewer{position:absolute;top:50%;left:50%;width:960px;height:600px;background:#000;border-radius:5px;box-shadow:0 0 5px 2px rgba(255,255,255,0.3);-webkt-box-shadow:0 0 5px 2px rgba(255,255,255,0.3);-moz-box-shadow:0 0 5px 2px rgba(255,255,255,0.5);user-select: none;-webkit-user-select: none;-moz-user-select: none;-ms-user-select:none;  }';
			cssHtml+='#popup_x_viewer #main_x_viewer.leftcurror{cursor:url(http://www.9game.cn/public/images/pc/pc_9game_public/x_man_viewer/pic_prev.gif),pointer;}';
			cssHtml+='#popup_x_viewer #main_x_viewer.rightcurror{cursor:url(http://www.9game.cn/public/images/pc/pc_9game_public/x_man_viewer/pic_next.gif),pointer;}';
			cssHtml+='#main_x_viewer #imgTemp_x_viewer{display:none;position:absolute;left:50%;top:50%;border:0;}';
			cssHtml+='#main_x_viewer #imgLoading_x_viewer{display:block;position:absolute;top:50%;left:50%;width:32px;height:32px;margin:-16px 0 0 -16px;border:0;}';
			cssHtml+='#main_x_viewer #close_x_viewer{display:block;position:absolute;top:-15px;right:-15px;width:30px;height:30px;background:url(http://www.9game.cn/public/images/pc/pc_9game_public/x_man_viewer/multipic_ico.png) no-repeat -2px -3px;cursor:pointer;}';
			cssHtml+='#main_x_viewer #close_x_viewer:hover{background-position:-2px -44px;}';
			cssHtml+='* html #popup_x_viewer{position:absolute;bottom:auto;top:expression(eval(document.documentElement.scrollTop));}';
			cssHtml+='.popup_of_x_viewer {overflow: hidden;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer{width:100%;height:70px;position:absolute;bottom:0;left:0;background:#2F2F2F;opacity:0;filter:alpha(opacity=0);overflow:hidden;}';
			cssHtml+='#main_x_viewer #list_x_viewer{height:100%;margin:0 15px;overflow:hidden;border:1px solid #666;border-width:0 1px;position:relative;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer ul{width:100%;height:100%;position:relative;left:0px;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer li{width:50px;height:50px;float:left;margin:8px 5px 0 5px;border:2px solid #2F2F2F;cursor:pointer;opacity:0.5;filter:alpha(opacity=50);transition: all 100ms;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer li:hover{border:2px solid #f60;opacity:1;filter: alpha(opacity=100);transform: scale(1.2,1.2);-webkit-transform: scale(1.2,1.2);-moz-transform: scale(1.2,1.2);-o-transform: scale(1.2,1.2);-ms-transform: scale(1.2,1.2);}';
			cssHtml+='#main_x_viewer #listcon_x_viewer li.on{border:2px solid #f60;opacity:1;filter: alpha(opacity=100);}';
			cssHtml+='#main_x_viewer #listcon_x_viewer li img{width:100%;height:100%;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer #left_x_viewer,#main_x_viewer #listcon_x_viewer #right_x_viewer{display: block; width: 14px; height: 70px; line-height: 70px; text-align: center; z-index: 2;position:absolute;top:0;cursor: default; color: #696969;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer #left_x_viewer{left:0;border-right: 1px solid #222;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer #right_x_viewer{right:0;border-left: 1px solid #222;}';
			cssHtml+='#main_x_viewer #listcon_x_viewer #left_x_viewer.on,#main_x_viewer #listcon_x_viewer #right_x_viewer.on{color:#fff;font-weight:700;cursor:pointer;}';
			this.headEle.appendChild(css);
			var cssId=doc.getElementById("popup_css_x_viewer");
			if(this.bows=='IE6' || this.bows=='IE7' || this.bows=='IE8') css.styleSheet.cssText=cssHtml;
			else css.innerHTML=cssHtml;
		}
		, createBaseDom:function(){
			var popup=doc.createElement("div");
			var meng=doc.createElement("div");
			var main=doc.createElement("div");
			var loading=doc.createElement("img");
			var img=doc.createElement("img");
			var close=doc.createElement("span");
			var listcon=doc.createElement("div");
			var list=doc.createElement("div");
			popup.id='popup_x_viewer';
			meng.id='meng_x_viewer';
			main.id='main_x_viewer';
			loading.id='imgLoading_x_viewer';
			loading.src='http://www.9game.cn/public/images/pc/pc_9game_public/x_man_viewer/x_img_viewer_loading.gif';
			img.id='imgTemp_x_viewer';
			listcon.id='listcon_x_viewer';
			list.id='list_x_viewer';
			close.id='close_x_viewer';
			close.title='关闭';
			this.bodyEle.appendChild(popup);
			popup.appendChild(meng);
			popup.appendChild(main);
			main.appendChild(loading);
			main.appendChild(img);
			main.appendChild(close);
			main.appendChild(listcon);
			listcon.appendChild(list);
		}
		, getBaseData:function(){
			this.nowWidth=960;
			this.nowHeight=600;
			this.maxWidth=960;
			this.maxHieght=600;
			this.minWidth=320;
			this.minHeight=480;
			this.minMargin=20;
			this.minPadding=10;
			this.littleWidth=64;
			this.body=doc.getElementsByTagName('body')[0];
			this.popup=doc.getElementById('popup_x_viewer');
			this.main=doc.getElementById('main_x_viewer');
			this.meng=doc.getElementById('meng_x_viewer');
			this.contain=doc.getElementById('x_img_viewer');
			this.img=doc.getElementById('imgTemp_x_viewer');
			this.loading=doc.getElementById('imgLoading_x_viewer');
			this.close=doc.getElementById('close_x_viewer');
			this.imgList=this.contain.getElementsByTagName('img');
			this.littlecon=doc.getElementById('listcon_x_viewer');
			this.ulcon=doc.getElementById('list_x_viewer');
			this.imgUrlSmall=[];
			this.imgUrl=[];
			this.index=-1;
			this.littleTimer=null;
		}
		, getImgUrl:function(){
			for(var i=0;i<this.imgList.length;i++){
				if(this.imgList[i].getAttribute('x_img_viewer_url') && this.imgList[i].getAttribute('x_img_viewer_url').length>0){
					this.imgUrl.push(this.imgList[i].getAttribute('x_img_viewer_url'));
				}
				else{
					this.imgUrl.push(this.imgList[i].src);
				}
				this.imgList[i].title='点击查看大图';
				this.imgUrlSmall.push(this.imgList[i].src);
			}
		}
		, addBaseEvent:function(){
			var This=this;
			if(window.addEventListener){
				window.addEventListener('resize',function(){
					This.winPopupRisize();
				}
				,false);
				this.meng.addEventListener('click',function(){
					This.popup.style.display='none';
					This.body.className= This.body.className.replace(/popup_of_x_viewer/ig ,'');
				}
				,false);
				for(var i=0;i<this.imgList.length;i++){
					+function(i){
						This.imgList[i].addEventListener('click',function(){
							if(!doc.getElementById('listul_x_viewer')){
								This.littleImg();
							}
							This.body.className= This.body.className+" popup_of_x_viewer";
							This.popup.style.display='block';
							tools.startMove(This.littlecon,{
								'opacity':100
							});
							This.imgShow(i);
						}
						,false);
					}(i);
				}
				this.main.addEventListener('mousemove',function(e){
					This.mouseChange(This.sideDef(e));
				}
				,false);
				this.main.addEventListener('click',function(e){
					This.imgChange(This.sideDef(e));
				}
				,false);
				this.close.addEventListener('click',function(e){
					This.body.className= This.body.className.replace(/popup_of_x_viewer/ig ,'');
					This.popup.style.display='none';
				}
				,false);
			}
			else{
				window.attachEvent('onresize',function(){
					This.winPopupRisize();
				}
				,false);
				this.meng.attachEvent('onclick',function(){
					This.body.className= This.body.className.replace(/popup_of_x_viewer/ig ,'');
					This.popup.style.display='none';
				}
				,false);
				for(var i=0;i<this.imgList.length;i++){
					+function(i){
						This.imgList[i].attachEvent('onclick',function(){
							if(!doc.getElementById('listul_x_viewer')){
								This.littleImg();
							}
							This.body.className= This.body.className+" popup_of_x_viewer";
							This.popup.style.display='block';
							tools.startMove(This.littlecon,{
								'opacity':100
							});
							This.imgShow(i);
						}
						,false);
					}(i);
				}
				this.main.attachEvent('onmousemove',function(e){
					This.mouseChange(This.sideDef(e));
				}
				,false);
				this.main.attachEvent('onclick',function(e){
					This.imgChange(This.sideDef(e));
				}
				,false);
				this.close.attachEvent('onclick',function(e){
					This.body.className= This.body.className.replace(/popup_of_x_viewer/ig ,'');
					This.popup.style.display='none';
				}
				,false);
			}
		}
		, winPopupRisize:function(){
			var imgWidth=this.img.width;
			var imgHeight=this.img.height;
			var winWidth=parseInt(doc.documentElement.clientWidth);
			var winHeight=parseInt(document.documentElement.clientHeight);
			var width=0;
			var left=0;
			var hieght=0;
			var top=0;
			var mWidth=0;
			var mHieght=0;
			if(winWidth < this.maxWidth + this.minMargin*2){
				width=winWidth - (this.minMargin*2);
				left=this.minMargin;
				this.nowWidth=width;
			}
			else{
				width=this.maxWidth;
				left=(winWidth-this.nowWidth )/ 2;
				this.nowWidth=this.maxWidth;
			}
			if(winHeight < this.maxHieght+ this.minMargin*2){
				height=winHeight - (this.minMargin*2);
				top=this.minMargin;
				this.nowHeight=height;
			}
			else{
				height=this.maxHieght;
				top=(winHeight-this.nowHeight)/ 2;
				this.nowHeight=this.maxHieght;
			}
			if(imgWidth > this.nowWidth - this.minPadding*2){
				width=imgWidth+this.minPadding*2;
				if(winWidth < imgWidth + this.minMargin*2 + this.minPadding*2){
					left=this.minMargin;
					mWidth=width+this.minMargin*2 + 'px';
				}
				else{
					left=(winWidth - width )/ 2;
					mWidth='100%';
				}
			}
			else{
				left=(winWidth-this.nowWidth )/ 2;
				mWidth='100%';
			}
			if(imgHeight > this.nowHeight - this.minPadding*2){
				height=imgHeight+this.minPadding*2;
				if(winHeight < imgHeight + this.minMargin*2 + this.minPadding*2){
					top=this.minMargin;
					mHieght=height+this.minMargin*2 + 'px';
					left=left  - 15 ;
				}
				else{
					top=(winHeight - height)/ 2;
					mHieght='100%';
				}
			}
			else{
				top=(winHeight - this.nowHeight )/ 2;
				mHieght='100%';
			}
			this.nowWidth=width;
			this.nowHeight=height;
			tools.setCss(this.main , {
				'width':width+ 'px','left':left+'px'
			});
			tools.setCss(this.main , {
				'height':height+ 'px','top':top+'px'
			});
			tools.setCss(this.meng , {
				'width':mWidth,'height':mHieght
			});
			var imgleft=(this.nowWidth-this.img.width)/2;
			var imgtop=(this.nowHeight-this.img.height)/2;
			tools.setCss( this.img , {
				'left':imgleft + 'px','top':imgtop + 'px'
			});
			if(this.left) this.hasCtrl();
		}
		, imgShow:function(index){
			var This=this;
			This.index=index;
			this.loading.style.display='block';
			this.img.style.display='none';
			this.img.onload = function(){
				this.style.display='block';
				This.loading.style.display='none';
				This.winPopupRisize();
			};
			this.img.src=this.imgUrl[index];
			This.littleImgAct(index);
		}
		, sideDef:function(e){
			var e = e || window.event;
			var x=e.clientX+this.popup.scrollLeft;
			var y=e.clientY+this.popup.scrollTop;
			var left=this.main.offsetLeft;
			var top=this.main.offsetTop;
			if(y-top < this.nowHeight - 70){
				if(!this.littleTimer){
					this.littleHide();
				}
				if( x-left < this.nowWidth /2){
					return 1;
				}
				else{
					return 2;
				}
			}
			else{
				this.main.className='';
				tools.startMove(this.littlecon,{
					'opacity':100
				});
				clearInterval(this.littleTimer);
				this.littleTimer=null;
			}
			return ;
		}
		, mouseChange:function(side){
			if(side==1){
				this.main.className='leftcurror';
				this.main.title='点击上一张';
			}
			else if(side==2){
				this.main.className='rightcurror';
				this.main.title='点击下一张';
			}
		}
		, imgChange:function(side){
			var index=-1;
			if(side==1){
				index=( this.index  + this.imgUrl.length -1) % (this.imgUrl.length);
			}
			else if(side==2){
				index=( this.index + 1 ) % (this.imgUrl.length);
			}
			if(side) this.imgShow(index);
		}
		, littleImg:function(){
			var ul=doc.createElement("ul");
			ul.id='listul_x_viewer';
			this.ulcon.appendChild(ul);
			this.ulList=doc.getElementById('listul_x_viewer');
			for(var i=0;i<this.imgUrl.length;i++){
				var li=doc.createElement("li");
				var img=doc.createElement("img");
				img.src=this.imgUrlSmall[i];
				li.appendChild(img);
				this.ulList.appendChild(li);
			}
			this.ulList.style.width=(this.imgUrl.length+1)*this.littleWidth + 'px';
			this.littleImgEvent();
		}
		, littleImgEvent:function(){
			var This=this;
			this.liList=this.ulList.getElementsByTagName('li');
			for(var i=0;i<this.liList.length;i++){
				+function(i){
					if(window.addEventListener){
						This.liList[i].addEventListener('click',function(){
							This.imgShow(i);
							This.littleImgAct(i);
						}
						,false);
					}
					else{
						This.liList[i].attachEvent('onclick',function(){
							This.imgShow(i);
							This.littleImgAct(i);
						}
						,false);
					}
				}(i);
			}
			this.leftRightCtrl();
		}
		, littleImgAct:function(index){
			for(var i=0;i<this.liList.length;i++){
				if(i==index){
					this.liList[i].className='on';
				}
				else{
					this.liList[i].className='';
				}
			}
		}
		, leftRightCtrl:function(){
			var This=this;
			var left=doc.createElement("a");
			var right=doc.createElement("a");
			left.id='left_x_viewer';
			left.href='javascript:void(0);';
			left.target='_self';
			right.id='right_x_viewer';
			right.href='javascript:void(0);';
			right.target='_self';
			this.littlecon.appendChild(left);
			this.littlecon.appendChild(right);
			this.left=doc.getElementById('left_x_viewer');
			this.right=doc.getElementById('right_x_viewer');
			this.left.innerText='\<';
			this.right.innerText='\>';
			if(window.addEventListener){
				This.left.addEventListener('click',function(){
					This.leftCtrl();
				}
				,false);
				This.right.addEventListener('click',function(){
					This.rightCtrl();
				}
				,false);
			}
			else{
				This.left.attachEvent('onclick',function(){
					This.leftCtrl();
				}
				,false);
				This.right.attachEvent('onclick',function(){
					This.rightCtrl();
				}
				,false);
			}
		}
		, littleImgLength:function(){
			var width=parseInt(this.ulcon.offsetWidth);
			return parseInt(width/this.littleWidth);
		}
		, leftCtrl:function(){
			if(this.ulcon.offsetWidth<this.imgUrl.length*this.littleWidth){
				var left=parseInt(this.ulList.offsetLeft) + this.littleImgLength()*this.littleWidth;
				if(left>=0){
					this.left.className='';
					left=0;
				}
				this.right.className='on';
				tools.startMove(this.ulList,{
					'left':left
				});
			}
		}
		, rightCtrl:function(){
			if(this.ulcon.offsetWidth<this.imgUrl.length*this.littleWidth){
				var left=parseInt(this.ulList.offsetLeft) + this.littleImgLength()*this.littleWidth  * -1;
				if(left < (this.imgUrl.length-this.littleImgLength())*this.littleWidth * -1){
					left=(this.imgUrl.length-this.littleImgLength())*this.littleWidth * -1;
					this.right.className='';
				}
				this.left.className='on';
				tools.startMove(this.ulList,{
					'left':left
				});
			}
		}
		, hasCtrl:function(){
			var ulWidth=this.ulcon.offsetWidth;
			if(ulWidth<this.imgUrl.length*this.littleWidth){
				this.right.className='on';
				if(ulWidth<0){
					this.left.className='on';
				}
				else{
					this.left.className='';
				}
			}
			else{
				this.left.className='';
				this.right.className='';
			}
		}
		, littleHide:function(){
			var This=this;
			this.littleTimer=setTimeout(function(){
				tools.startMove(This.littlecon,{
					'opacity':0
				});
			}
			,3000);
		}
	};
	if(doc.getElementById('x_img_viewer')){
		app.init();
	}
}(window,document));