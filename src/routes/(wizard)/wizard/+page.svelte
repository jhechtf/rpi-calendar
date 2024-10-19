<script>
  import Step from "$lib/components/wizard/step.svelte";
  import Wizard from "$lib/components/wizard/wizard.svelte";
  import { PUBLIC_GOOGLE_CLIENT_ID } from "$env/static/public";
</script>

<h1 class="text-2xl font-extrabold p-8 text-zinc-700 dark:text-zinc-100">
  Wizard
</h1>

<div
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
></div>

<Wizard>
  <Step id="step-1" title="Stepson 1">
    <input class="px-3 py-2 rounded" placeholder="Your name, my good bitch" />
  </Step>
  <Step id="step-2" title="Stepson 2">Step 2</Step>
  <Step id="step-3" title="Stepson 3">Step 3</Step>
</Wizard>
