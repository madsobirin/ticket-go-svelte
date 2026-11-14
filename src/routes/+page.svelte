<script>
	import MemberLayout from '$lib/components/member/MemberLayout.svelte';
	import MemberDashboard from '$lib/components/member/MemberDashboard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Ticket Go - Reservasi Tiket Travel Antarkota</title>
</svelte:head>

<MemberLayout {data}>
	<MemberDashboard {data} />
</MemberLayout>
