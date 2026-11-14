<script>
	import MemberLayout from '$lib/components/member/MemberLayout.svelte';

	let { data, children } = $props();
</script>

<MemberLayout {data}>
	{#if children}
		{@render children()}
	{/if}
</MemberLayout>
