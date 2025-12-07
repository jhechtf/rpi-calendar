<script>
  import { Steps } from '@skeletonlabs/skeleton-svelte';
  import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';

  const steps = [
		{ title: 'First', content: 'First do this.' },
		{ title: 'Then', content: 'Then do that.' },
		{ title: 'Finally', content: 'Almost done...' },
	];
</script>

<div class="w-7/8 mx-auto">
  <h1 class="h1 mt-8">
    Wizard
  </h1>
  
  <!-- <div
    id="g_id_onload"
    data-client_id={PUBLIC_GOOGLE_CLIENT_ID}
    data-login_uri="http://localhost:3000/your_login_endpoint"
    data-auto_prompt="false"
  ></div>
  <div
    class="g_id_signin"
    data-type="standard"
    data-size="large"
    data-theme="outline"
    data-text="sign_in_with"
    data-shape="rectangular"
    data-logo_alignment="left"
  ></div> -->
  
  <Steps orientation="vertical" count={steps.length} class="mx-auto mt-8 h-full">
    <Steps.List>
      {#each steps as item, index}
        <Steps.Item {index}>
          <Steps.Trigger>
            <Steps.Indicator>{index + 1}</Steps.Indicator>
            {item.title}
          </Steps.Trigger>
          {#if index < steps.length - 1}
            <Steps.Separator />
          {/if}
        </Steps.Item>
      {/each}
    </Steps.List>
    <div class="flex flex-col grow">
      {#each steps as item, index}
        <Steps.Content {index} class="grow">
          {item.content}
        </Steps.Content>
      {/each}
      <Steps.Content index={steps.length} class="grow">All done!</Steps.Content>
      <div class="flex justify-between items-center gap-2">
        <Steps.PrevTrigger class="btn preset-filled">Back</Steps.PrevTrigger>
        <Steps.NextTrigger class="btn preset-filled">Next</Steps.NextTrigger>
      </div>
    </div>
  </Steps>
</div>

