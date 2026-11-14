<script>
	import MemberDashboard from '$lib/components/member/MemberDashboard.svelte';

	let { data } = $props();
</script>

<MemberDashboard {data} />
