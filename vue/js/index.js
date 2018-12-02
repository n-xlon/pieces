let pieces = {
	data: {
		ulist: [],
	  domW: 0,
	  domH: 0,
	  latticeNums: 3,
	  curT: 0,    // mousedown事件top值
		curL: 0,    // mousedown事件left值
		ctop: 0,    // 当前拼块的top值
		cleft: 0,   // 当前拼块的left值
		changeY: 0,   // move y值
		changeX: 0,   // move x值
		cliX: 0,      // mousemove事件clientX值
		cliY: 0,      // mousemove事件clientY值
		el: '',    // 当前头东的拼块
		pieces: document.getElementsByClassName('jigsaw_modal')[0]
	},
	created () {
		let that = this
		let dom = document.getElementsByClassName('jigsaw_modal')[0]
		this.domW = dom.offsetWidth
		this.domH = dom.offsetHeight
		let pieceW = this.domW / this.latticeNums - 2
		let pieceH = this.domH / this.latticeNums - 2
		for (let i = 1; i <= Math.pow(this.latticeNums, 2); i++) {
			let cDom = document.createElement('li')
			cDom.className = 'jigsaw_piece'
			cDom.style.width = pieceW + 'px'
			cDom.style.height = pieceH + 'px'
			cDom.setAttribute('data-label', i)
			let w = pieceW * (i - (+Math.ceil(i/this.latticeNums) * this.latticeNums - this.latticeNums) - 1)
			let h = pieceH * (Math.ceil(i/this.latticeNums) - 1)
			cDom.style.background = "url('../images/pic.jpg') -" + w + "px -" + h + "px"
			cDom.style.top = h + 'px'
			cDom.style.left = w + 'px'
			this.ulist.push(cDom.outerHTML)
		}
		dom.innerHTML = this.ulist.join('')
    document.addEventListener('gesturestart', function(event) {
      event.preventDefault();
          // alert(1111)
    })
    setTimeout(function(){
			that.randomPieces()
			that.listenPieces()
		}, 2000)
	},
	methods: {
		randomPieces () {
			let temp = '', top, left
			let len = this.ulist.length - 1
			for (let i = len - 1; i >= 0; i--) {
				let dm = document.getElementsByClassName('jigsaw_piece')
				let rmd = parseInt(Math.random() * len)
				top = dm[rmd].style.top
				left = dm[rmd].style.left
				label = dm[rmd].getAttribute('data-label')
				dm[rmd].style.top = dm[i].style.top
				dm[rmd].style.left = dm[i].style.left
				dm[rmd].setAttribute('data-label', dm[i].getAttribute('data-label'))
				dm[i].style.top = top
				dm[i].style.left = left
				dm[i].setAttribute('data-label', label)
			}
		},
		listenPieces () {
			this.pieces.addEventListener('mousedown', this.mousedownPieces)
			this.pieces.addEventListener('touchstart', this.mousedownPieces)
		},
		mousedownPieces (e) {
			e.preventDefault()
      if (e.touches && e.touches.length > 1) {
     		return
      }
      this.el = e.target
			if (this.el.className !== 'jigsaw_piece') return
			let scrollT = document.body.scrollTop
			this.curT = e.clientY || e.touches[0].clientY
			this.curL = e.clientX || e.touches[0].clientX
			if (scrollT) {
				//alert(document.body.scrollTop)
				this.curT += scrollT
			}
			this.ctop = +this.el.style.top.replace(/px/, '')
			this.cleft = +this.el.style.left.replace(/px/, '')
			document.addEventListener('mousemove', this.movePieces)
			this.pieces.addEventListener('mouseup', this.upPieces)
			document.addEventListener('touchmove', this.movePieces)
			this.pieces.addEventListener('touchend', this.upPieces)
		},
		movePieces (e) {
			this.cliX = e.clientX || e.touches[0].clientX
			this.cliY = e.clientY || e.touches[0].clientY
			let scrollT = document.body.scrollTop
			if (scrollT) {
				this.cliY += scrollT
			}
			e.stopPropagation()
      e.preventDefault()
			this.changeY = this.ctop - (this.curT - this.cliY)
			this.changeX = this.cleft - (this.curL - this.cliX)
			this.el.style.top = this.ctop - (this.curT - this.cliY) + 'px'
			this.el.style.left = this.cleft - (this.curL - this.cliX) + 'px'
			this.el.style.opacity = .5
			this.el.style.zIndex = 10
			document.addEventListener('touchend', this.upPieces)
			document.addEventListener('mouseup', this.upPieces)
			document.addEventListener('onblur', this.upPieces)
		},
		upPieces () {
			document.removeEventListener('mousemove', this.movePieces)
			document.removeEventListener('mouseup', this.upPieces)
			document.removeEventListener('touchmove', this.movePieces)
			this.pieces.removeEventListener('touchend', this.upPieces)
			document.removeEventListener('touchend', this.upPieces)
			document.removeEventListener('touchmove', this.movePieces)
			this.pieces.removeEventListener('mouseup', this.upPieces)

			let domAll = document.getElementsByClassName('jigsaw_piece')
			let parent = domAll[0].parentNode
			let top = 0
			let left = 0
			parentNode(parent)
			function parentNode (parent) {
				top += parent.offsetTop
				left += parent.offsetLeft
				if (parent.parentNode && typeof parent.parentNode.offsetTop !== 'undefined') {
					parentNode(parent.parentNode)
				}
			}
	
			if (this.el) {
				this.el.style.opacity = 1
				this.el.style.zIndex = ''
			}
			if (+this.cliY >= this.domH + top || +this.cliX >= this.domW + left || +this.cliX <= left || +this.cliY <= top) {
				this.el.style.top = this.ctop + 'px'
				this.el.style.left = this.cleft + 'px'
				return
			}
			this.getAllPiecesPosition(domAll, top, left)
		},
		getAllPiecesPosition (domAll, top, left) {
			let type = false
			if (domAll && domAll.length > 0) {
				for(let j = 0; j < domAll.length; j++) {
					let t = +domAll[j].style.top.replace(/px/, '')
					let l = +domAll[j].style.left.replace(/px/, '')
					let label = domAll[j].dataset.label
					if (+this.cliY >= t + top && +this.cliY <= t + (this.domH / this.latticeNums - (this.latticeNums - 1)) + top && +this.cliX >= l + left && +this.cliX <= l + (this.domW / this.latticeNums - (this.latticeNums - 1)) + left && label !== this.el.dataset.label) {
						type = true
						domAll[j].style.top = this.ctop + 'px'
						domAll[j].style.left = this.cleft + 'px'
						domAll[j].dataset.label = this.el.dataset.label
						this.el.style.top = t + 'px'
						this.el.style.left = l + 'px'
						this.el.setAttribute('data-label', label)
						// console.log(t, l, ctop, cleft, domAll[j].dataset.label, el.dataset.label)
					}
				}
				if (!type) {
					this.el.style.top = this.ctop + 'px'
					this.el.style.left = this.cleft + 'px'
				}
				this.checkPieces()	
			}
		},
		checkPieces () {
			let checkList = document.getElementsByClassName('jigsaw_piece')
			let arr = []
			let str = ''
			if (checkList && checkList.length > 0) {
				for(let j = 1; j <= checkList.length; j++) {
					arr.push(checkList[j-1].dataset.label)
					str += j
				}
				if (arr.join('') == str) {
					this.pieces.removeEventListener('mousedown', this.mousedownPieces)
          this.pieces.removeEventListener('touchstart', this.mousedownPieces)
					setTimeout(function () {
						alert('拼图完成')
					}, 1000)
				}
			}
		}
	}
}
