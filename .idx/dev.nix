{ pkgs }: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
  ];
  idx.extensions = [

  ];
 
   env = {
    #TODO Get a API key from https://g.co/ai/idxGetGeminiKey 
    GOOGLE_GENAI_API_KEY = "REPLACE_ME_GOOGLE_GENAI_API_KEY"; 
  };

  # Workspace lifecycle hooks
  idx.workspace = {
    # Runs when a workspace is first created
    onCreate = {
      npm-install = "npm ci --no-audit --prefer-offline --no-progress --timing";
      default.openFiles = [ "README.md" "src/terminal.ts" ];
    };
    # Runs when the workspace is (re)started
    onStart = {
      run-server = "if [ -z \"\${GOOGLE_GENAI_API_KEY}\" ]; then \
          echo 'No Gemini API key detected, enter a Gemini API key from https://aistudio.google.com/app/apikey:' && \
          read -s GOOGLE_GENAI_API_KEY && \
          echo 'You can also set the key in .idx/dev.nix to automatically add to your workspace'
          export GOOGLE_GENAI_API_KEY; \
          fi && \
          npm run build";
    };
  };

  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "start"
          "--"
          "--port"
          "$PORT"
          "--hostname"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}
