<template>
	<view id="canvasbgView" class="canvasbgView"
		:style="{width:maxRadius * 2 + 'px',height: maxRadius * 2 + 'px'}">
		<view class="canvasView" @click="canvasClick($event)">
			<canvas 
				:style="{width:maxRadius * 2 + 'px',height: maxRadius * 2 + 'px',backgroundColor:backgroundColor}"
				canvas-id="piechartCanvas" id="piechartCanvas">
			</canvas>
		</view>
	</view>
</template>

<script>
	export default {
		mounted() {

		},
		props: {
			//饼图的半径
			radius: {
				type: Number,
				default: 150
			},
			//触摸屏幕后，选中时的饼图的半径 ，大于等于饼图半径
			selectRadius:{
				type: Number,
				default: -1
			},
			//标题的文字大小
			titleFontSize: {
				type: Number,
				default: 13
			},
			//正常标题的颜色
			titleColor: {
				type: String,
				default: "#fff"
			},
			//选中的标题的颜色
			titleSelectColor: {
				type: String,
				default: "#fff"
			},
			//选中的单块拼图的背景颜色
			selectColor: {
				type: String,
				default: "#4BD0D8"
			},
			//绘图的线条颜色
			strokeStyle: {
				type: String,
				default: "#F8F8F8"
			},
			lineWidth: {
				type: Number,
				default: 0.5
			},
			//是否启用触摸点击
			isEnableTouch: {
				type: Boolean,
				default: true
			},
			//canvas背景色
			backgroundColor: {
				type: String,
				default: 'transparent',
			},
			//canvas背景图片链接
			backgroundImageUrl: {
				type: String,
				default: '',
			},
			pieChartData:{
				type: Array,
				default: () => []
			},
		},
		mounted() {
			this.maxRadius = Math.max(this.radius,this.selectRadius)
			if (this.pieChartData.length > 0){
				this.updatePieChart()
			}
		},
		data() {
			return {
				piechartList: [],
				canvasImg: null,
				selectIndex:-1,
				maxRadius:Math.max(this.radius,this.selectRadius)
			}
		},
		watch: {
			pieChartData(){
				// console.log('监听', this.pieChartData)
				this.updatePieChart()
			},
			radius() {
				// console.log('监听', this.radius)
				this.maxRadius = Math.max(this.radius,this.selectRadius)
				if (this.pieChartData.length > 0){
					this.drawPieChart(-1)
				}
			},
			selectRadius() {
				// console.log('监听', this.selectRadius)
				this.maxRadius = Math.max(this.radius,this.selectRadius)
				if (this.pieChartData.length > 0){
					this.drawPieChart(-1)
				}
			},
		},
		methods: {
			updatePieChart() {
				this.initData()
				this.drawPieChart(-1)
			},
			initData() {

				var piechartList = []
				//从正上方开始算角度
				var startAngle = 1.5 * Math.PI
				var endAngle = 0
				let everyAngle = (1 / this.pieChartData.length) * Math.PI * 2
				let everyAngleInterval = (1 / this.pieChartData.length) * 360
				var startAngleInterval = 0
				var endAngleInterval = 0

				for (var i = 0; i < this.pieChartData.length; i++) {
					let chartData = this.pieChartData[i]
					endAngle = startAngle + everyAngle
					endAngleInterval = startAngleInterval + everyAngleInterval
					let item = {
						fillColor: chartData.colour,
						startAngle: startAngle,
						endAngle: endAngle,
						text: chartData.title,
						angleInterval: [startAngleInterval, endAngleInterval] //单个饼图的与正Y轴的角度区间
					}
					piechartList.push(item)
					startAngle = endAngle
					startAngleInterval = endAngleInterval
				}
				this.piechartList = piechartList
			},
			canvasClick(e) {

				// console.log(e)
				if (!this.isEnableTouch) {
					return
				}
				let padding = this.maxRadius - this.radius
				
				var originX = e.detail.x - padding
				var originY = e.detail.y - padding
				let that = this
				const query = uni.createSelectorQuery().in(this);
				query.select('#canvasbgView').boundingClientRect(data => {
					// console.log("得到布局位置信息" , data);
					// console.log("节点离页面顶部的距离为");
					originX = originX - data.left
					originY = originY - data.top
					// console.log('---'+originX+"-++++"+originY)
					that.clickPieChartPosition(originX, originY)
				}).exec();

			},

			clickPieChartPosition(originX, originY) {

				/*点击拼图获取对应的饼图的思路：
				1、判断点击位置是否落在饼图上，通过点击的位置，计算以饼图为圆心做为原点，算出与Y轴和X轴的距离，
				点击位置与原点的距离 = （Y轴距离的平方 + X轴距离的平方）的根号，点击位置与原点的距离 <= 饼图的半径，说明点击位置落在饼图上
				2、找出具体点击的是哪块饼图，通过点击的位置，用正切值来计算正切角度，从而计算出点击位置的与原点的正Y轴上的夹角，
				通过比较夹角是否落在饼图夹角范围，找出具体是那块饼图
				*/
				var includedAngle = -1
				if (originX < this.radius) {
					//左半部分的半圆
					if (originY > this.radius) {
						//说明点击的地方在圆心的正下方
						// 与饼图为圆心坐标的，距离的X轴的距离
						let positionY = originY - this.radius
						let positionX = this.radius - originX
						//计算点击点的圆的半径
						let clickRadius = Math.sqrt(Math.pow(positionX, 2) + Math.pow(positionY, 2))

						if (clickRadius < this.radius) {
							//点击点的半径小于饼图圆的半径，说明点击落在饼图上
							//计算与正方Y轴的夹角，通过正切值来求角度，因为点击点在X轴的下方，所以要+90度
							includedAngle = 270 - Math.atan(positionY / positionX) / (Math.PI / 180)
							// console.log('与正Y轴的角的度数:'+includedAngle)
						} else {
							// console.log('点击不落在饼图上')
						}
						// console.log(clickRadius)

					} else if (originY < this.radius) {

						// 与饼图为圆心坐标的，距离的X轴的距离
						let positionY = this.radius - originY
						let positionX = this.radius - originX
						//说明点击的地方在圆心的正上方
						let clickRadius = Math.sqrt(Math.pow(positionX, 2) + Math.pow(positionY, 2))
						if (clickRadius < this.radius) {
							//点击点的半径小于饼图圆的半径，说明点击落在饼图上
							//计算与正方Y轴的夹角，通过正切值来求角度，因为点击点在X轴的上方，所以要90度-正切的角度
							includedAngle = 270 + Math.atan(positionY / positionX) / (Math.PI / 180)
							// console.log('与正Y轴的角的度数:'+includedAngle)
						} else {
							// console.log('点击不落在饼图上')
						}
						// console.log(clickRadius)
					} else {
						includedAngle = 90
					}
				} else {
					//右半部分的半圆

					if (originY > this.radius) {
						//说明点击的地方在圆心的正下方
						// 与饼图为圆心坐标的，距离的X轴的距离
						let positionY = originY - this.radius
						let positionX = originX - this.radius
						//计算点击点的圆的半径
						let clickRadius = Math.sqrt(Math.pow(positionX, 2) + Math.pow(positionY, 2))

						if (clickRadius < this.radius) {
							//点击点的半径小于饼图圆的半径，说明点击落在饼图上
							//计算与正方Y轴的夹角，通过正切值来求角度，因为点击点在X轴的下方，所以要+90度
							includedAngle = Math.atan(positionY / positionX) / (Math.PI / 180) + 90
							// console.log('与正Y轴的角的度数:'+includedAngle)
						} else {
							// console.log('点击不落在饼图上')
						}
						// console.log(clickRadius)

					} else if (originY < this.radius) {

						// 与饼图为圆心坐标的，距离的X轴的距离
						let positionY = this.radius - originY
						let positionX = originX - this.radius
						//说明点击的地方在圆心的正上方
						let clickRadius = Math.sqrt(Math.pow(positionX, 2) + Math.pow(positionY, 2))
						if (clickRadius < this.radius) {
							//点击点的半径小于饼图圆的半径，说明点击落在饼图上
							//计算与正方Y轴的夹角，通过正切值来求角度，因为点击点在X轴的上方，所以要90度-正切的角度
							includedAngle = 90 - Math.atan(positionY / positionX) / (Math.PI / 180)
							// console.log('与正Y轴的角的度数:'+includedAngle)
						} else {
							// console.log('点击不落在饼图上')
						}
						// console.log(clickRadius)
					} else {
						includedAngle = 90
					}
				}
				if (includedAngle >= 0) {
					this.clickPieChart(includedAngle)
				}
			},


			clickPieChart(angle) {
				for (var i = 0; i < this.piechartList.length; i++) {
					let item = this.piechartList[i]
					let angleInterval = item.angleInterval
					if (angleInterval[0] < angle && angleInterval[1] >= angle) {
						if (this.selectIndex === i){
							return
						}
						this.selectIndex = i
						if (i < this.pieChartData.length) {
							let selectObj = this.pieChartData[i]
							this.$emit('touchPieChart', selectObj,i)
							this.drawPieChart(i)
							// console.log("点击拼图：" + selectObj.valName)
						}
						break
					}
				}
			},

			drawPieChart(index) {

				let ctx = uni.createCanvasContext('piechartCanvas', this)
				ctx.width = this.maxRadius*2
				ctx.height = this.maxRadius*2
				//清除画布，需要设置画布的背景颜色，才能达到清除效果
				ctx.clearRect(0, 0, this.maxRadius * 2, this.maxRadius * 2)
				let imageUrl = this.backgroundImageUrl || ""
				if (imageUrl.length > 0){
					
				}
				for (var i = 0; i < this.piechartList.length; i++) {
					ctx.save();
					let item = this.piechartList[i]
					ctx.beginPath();
					ctx.moveTo(this.maxRadius, this.maxRadius);
					var fillColor = item.fillColor
					var radius = this.radius
					//点击选择的效果
					if (index === i) {
						fillColor = this.selectColor
						radius = this.maxRadius
					}
					
					ctx.fillStyle = fillColor
					ctx.arc(this.maxRadius, this.maxRadius, radius, item.startAngle, item.endAngle, false);
					ctx.fill();
					ctx.closePath();
					if (this.piechartList.length !== 1) {
						ctx.lineWidth = this.lineWidth
						ctx.strokeStyle = this.strokeStyle;
						ctx.strok
						ctx.stroke(); //绘制线条
					}
					ctx.restore();

				}
				//每个瓣状的角度
				let angle = 360 / this.piechartList.length
				for (var i = 0; i < this.piechartList.length; i++) {
					let text = this.piechartList[i].text
					ctx.save()
					//设置字体颜色
					//点击选择的效果
					if (index === i) {
						ctx.fillStyle = this.titleSelectColor
					} else {
						ctx.fillStyle = this.titleColor
					}
					//设置字体的大小
					ctx.setFontSize(this.titleFontSize);
					let textWidth = ctx.measureText(text).width
                    
					if (this.piechartList.length === 1){
						//只有一个的时候，文本居中显示
						ctx.fillText(text, this.maxRadius - textWidth / 2.0, this.maxRadius)
					}else{
						//设置画布的旋转中心
						ctx.translate(this.maxRadius, this.maxRadius);
						//旋转角度，angle/2+3 为了显示在瓣状的中间，angle*i 度数计算， -90 为了从竖直正上方开始显示
						let rotate1 = (angle / 2 + 5 + angle * i - 90) * Math.PI / 180
						ctx.rotate(rotate1)
						//设置文本，和文本的位置
						ctx.fillText(text, this.radius / 2.0 - textWidth / 2.0 + 20, 0)
					}
					ctx.restore();

				}
				let that = this
				if (index === -1 && this.pieChartData.length > 0){
					ctx.draw(true, function() {
						uni.canvasToTempFilePath({
							canvasId: 'piechartCanvas',
							quality:1,
							success: function(res) {
								// 在H5平台下，tempFilePath 为 base64
								that.canvasImg = res.tempFilePath
								that.$emit('canvasScreenshot',res.tempFilePath)
								console.log('------'+res.tempFilePath)
							},
							fail(response) {
								console.log(response)
							}
						}, that)
					})
				}else{
					ctx.draw()
				}
					
			}
		}
	}
</script>

<style scoped>
	.canvasbgView {
		display: flex;
		flex-direction: row;
		position: relative;
	}

	.canvasView {
		background-color: transparent;
		position: absolute;
	}
</style>
