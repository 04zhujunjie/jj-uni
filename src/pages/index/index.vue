<template>
	<view class="content">
		<view style="margin-left: 30px;margin-top: 20px;">
<piechart style="margin-top: 5px" :radius=130 :titleFontSize=13.5 :selectRadius="selectRadius"
			:isEnableTouch=true :pieChartData="pieChartData" @canvasScreenshot="canvasScreenshot"
			@touchPieChart="touchPieChart" titleSelectColor="#000" selectColor="#f0f"></piechart>
		</view>
		
		<!-- 不能给在canvas上添加动画效果，因为canvas层级比较高，真机小程序测试的时候动画失效 -->
		<view class="image-bg">
			<view style="display: flex;position: absolute;left: -120px;"  @click="clickImg">
				<image class="img" :class="touchCount%2 === 1?'':'rotateImage'" v-if="canvasImg !== null" :src="canvasImg"></image>
			</view>
             <view style="margin-left: 130px;">
				 <image class="clockwiseImage img" v-if="canvasImg !== null" :src="canvasImg"></image>
			 </view>
		</view>

	</view>
</template>

<script>
	import piechart from '@/packages/piechart/piechart.vue'
	export default {
		components: {
			piechart
		},
		data() {
			return {
				title: 'Hello',
				selectRadius: 140,
				canvasImg: null,
				pieChartData: [],
				touchCount:0,
			}
		},
		mounted() {

			this.initData()
			// this.selectRadius = 180
		},
		methods: {
			initData() {
				var list = []
				// this.random(5, 20)
				for (let i = 0; i < 12; i++) {
					let valItem = {
						title: "测试" + i,
						colour: this.randomHexColor(),
					}
					list.push(valItem)
				}
				this.pieChartData = list
			},
			//随机颜色
			randomHexColor() { //随机生成十六进制颜色
				return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).substr(-6);
			},
			//随机数目
			random(min, max) {
				return Math.round(Math.random() * (max - min)) + min;
			},
			canvasScreenshot(canvasImg) {
				this.canvasImg = canvasImg
			},
			touchPieChart(item, index) {
				console.log(item.title, index)
			},
			
			clickImg(){
				this.touchCount +=1
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: center;
	}

	.image-bg {
		display: flex;
		flex-direction: row;
		margin-top: 5px;
		position: relative;
		/* justify-content: center; */
	}

	.img {
		width: 240px;
		height: 240px;
	}

	.rotateImage {
		/* 动画 */
		-webkit-animation: changeleft 0.6s linear infinite;
	}
	.clockwiseImage {
		/* 动画 */
		-webkit-animation: changeright 0.6s linear infinite;
	}

	@-webkit-keyframes changeleft {

		0% {
			-webkit-transform: rotate(0deg);
		}

		50% {
			/* 角度为负数,表示是逆时针旋转 */
			-webkit-transform: rotate(-180deg);
		}

		100% {
			/* 角度为负数,表示是逆时针旋转 */
			-webkit-transform: rotate(-360deg);
		}
	}
	
	@-webkit-keyframes changeright {
	
		0% {
			-webkit-transform: rotate(0deg);
		}
	
		50% {
			/* 角度为负数,表示是逆时针旋转 */
			-webkit-transform: rotate(180deg);
		}
	
		100% {
			/* 角度为负数,表示是逆时针旋转 */
			-webkit-transform: rotate(360deg);
		}
	}
</style>
