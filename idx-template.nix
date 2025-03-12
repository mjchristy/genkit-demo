{pkgs, apiKey, ...}: {
    packages = [
        pkgs.nodejs
    ];
    bootstrap = ''
		cp -rf ${./.}/. "$WS_NAME"
    sed -i "s/REPLACE_ME_GOOGLE_GENAI_API_KEY/${apiKey}/g" "$WS_NAME"/.idx/dev.nix
		chmod -R +w "$WS_NAME"

		mv "$WS_NAME" "$out"
    '';
}