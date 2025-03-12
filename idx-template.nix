{pkgs, apiKey, ...}: {
    packages = [
        pkgs.nodejs
    ];
    bootstrap = ''
		cp -rf ${./.}/. "$WS_NAME"
		chmod -R +w "$WS_NAME"

		mv "$WS_NAME" "$out"
    sed -i "s/REPLACE_ME_GOOGLE_GENAI_API_KEY/${apiKey}/g" "$out"/.idx/dev.nix
    '';
}