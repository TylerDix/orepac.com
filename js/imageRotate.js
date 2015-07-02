/*
	Simple image rotate script
	Jason M. Knight, 2013
	http://www.deathshadow.com
*/

var imageRotate={
	delayDefault : 2500,
	ticks : 40, // 25 fps
	selectedMultiplier : 0.5, // * delay, runs during manual select
	frames : 760,

	timer : 0,
	list : [],

	stopTimer : function() {
		clearTimeout(this.timer);
	},

	startTimer : function() {
		this.timer=setTimeout(this.handler,this.ticks);
	},

	handler : function() {

		var
			ir=imageRotate,
			t=0,
			i;

		while (i=ir.list[t++]) { with (i) {
			if (!paused) {
				counter+=ir.ticks;
				if (counter>=rotateDelay) {
					counter-=rotateDelay;
					timerAdjust=ir.frames;
					rotateTo();
					started=true;
				}
				with (timeLeft) {
					if (counter<0) { 
						style.width=(
							(counter / ir.selectedMultiplier) *
							-100 / rotateDelay
						)+'%';
						className='countdown';
					} else {
						style.width=(
							counter * 100 / rotateDelay
						)+'%';
						className='';
					}
				}
				var alpha=(
					(started && (counter<timerAdjust)) ?
					1-((timerAdjust-counter)/ir.frames) :
					1
				);
				currentIMG.style.opacity=alpha;
				currentIMG.style.filter='alpha(opacity='+alpha*100+')';
			}
		}}
		ir.startTimer();
	},

	addControl : function(parent,tag,classN,clickFunc) {
		with (temp=document.createElement(tag)) {
			className=classN;
			if (clickFunc) {
				temp.onclickFunction=clickFunc;
				onclick=function(e) {
					e=e || window.event;
					var t=e.target || e.srcElement;
					while (t && (!t.onclickFunction)) t=t.parentNode;
					if (t) t.onclickFunction();
					if (e.preventDefault) e.preventDefault(); else e.returnValue=false;
					return false;
				};
			}
		}
		parent.appendChild(temp);
		return temp;
	},

	add : function(pId,rotateDelay) {
		var
			p=document.getElementById(pId),
			ir=imageRotate;

		if (!p) return false;

		var i=p.firstChild;
		while (
			(i) &&
			(i.tagName != 'IMG')
		) i=i.nextSibling;
		if (!i) return false;
		p.firstIMG=p.currentIMG=i;

		i=p.lastChild;
		while (
			i &&
			(i.tagName != 'IMG')
		) i=i.previousSibling;
		p.lastImage=p.prevIMG=i;

		p.rotateDelay=(
			rotateDelay ? rotateDelay : this.delayDefault
		);
		p.counter=0;
		p.timerAdjust=ir.frames;
		p.paused=p.started=false;

		p.rotateTo=function(nIMG) {
			nIMG = nIMG ? nIMG : this.currentIMG.nextIMG;
			this.prevIMG.className='hide';
			with (this.prevIMG=this.currentIMG) {
				className='under';
				style.filter='alpha(opacity=100)';
				style.opacity=1;
				controlLI.className='';
			}
			with (nIMG = nIMG ? nIMG : this.currentIMG.nextIMG) {
				style.filter ='alpha(opacity=0)';
				style.opacity=0;
				className='show';
				controlLI.className='selected';
			}
			with (this) {
				currentIMG=nIMG;
				timerAdjust=imageRotate.frames;
				paused=false;
				pauseControl='pause';
			}
		}

		p.cleanRotateTo=function(nIMG) { with (imageRotate) {
			stopTimer();
			with (this) {
				rotateTo(nIMG);
				counter=-rotateDelay*selectedMultiplier;
				timerAdjust=counter+frames;
				started=true;
			}
			startTimer();
		}}

		var
			selectors=document.createElement('ul'),
			imgList=p.getElementsByTagName('img'),
			t=0;
			
		while (i=imgList[t]) {
			i.className=(t==0) ? 'show' : 'hide';
			i.nextIMG=imgList[t+1] ? imgList[t+1] : p.firstIMG;
			i.prevIMG=t>0 ? imgList[t-1] : p.lastImage;
			i=i.controlLI=ir.addControl(
				selectors,'li','',function() {
					var pn=this.parentNode.parentNode;
					if (pn.currentIMG != this.pImage) pn.cleanRotateTo(this.pImage);
				}
			);
			i.pImage=imgList[t];
			i.appendChild(document.createElement('span'));
			t++;
		}

		p.currentIMG.controlLI.className='selected';

		selectors.className='selectors';
		p.appendChild(selectors);

		var temp=ir.addControl(p,'div','timeLeft');
		p.timeLeft=document.createElement('div');
		temp.appendChild(p.timeLeft);

		p.pauseControl=ir.addControl(p,'div','pause',function() {
			this.className=(
				(this.parentNode.paused=!this.parentNode.paused) ?
				'play' : 'pause'
			);
		});

		ir.addControl(p,'div','next',function() {
			this.parentNode.cleanRotateTo(this.parentNode.currentIMG.nextIMG);
		});

		ir.addControl(p,'div','prev',function() {
			this.parentNode.cleanRotateTo(this.parentNode.currentIMG.prevIMG);
		});

		this.list.push(p);

	}

},

safeLoader={
	list : [],
	handler : function() {
		var ll=safeLoader.list, t=ll.length;
		while (ll[--t]) ll[t]();
	},
	add : function(func) {
		var w=window;
		if (w.addEventListener){
			w.addEventListener('load',func,false);
		} else if (w.attachEvent){
			w.attachEvent('onload',func);
		} else {
			if (this.list.length==0) w.onload=this.handler;
			this.list.push(func);
		}
	}
}

safeLoader.add(function() { imageRotate.startTimer(); });