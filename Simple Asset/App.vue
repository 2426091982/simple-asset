<script>
	import { useAssetStore } from './store/assets';
	import { useConfigStore } from './store/config';

	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			// 采用最简单、最稳健的同步初始化链路
			const assetStore = useAssetStore();
			const configStore = useConfigStore();
			
			assetStore.initStore();
			configStore.initStore();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	body {
		background-color: #f8f9fa;
	}
</style>
