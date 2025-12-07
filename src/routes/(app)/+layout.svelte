<script>
  import Navigation from "$lib/components/navigation.svelte";
  import "../../app.css";
  let { children } = $props();

</script>

{@render children()}