import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  clientId = '539eb3dde4a34d43af426943326af465'; // Replace with your client id
  params = new URLSearchParams(window.location.search);
  code = this.params.get("code");
  profile: any;

  constructor(private route: ActivatedRoute, private router: Router, private loginService: LoginService) {
    this.route.queryParams.subscribe((params) => {
      this.code = params['code'];
    });
  }
  
  async ngOnInit() {
    console.log('LoginComponent.ngOnInit() called');
    if (!this.code) {
      //wait 5 seconds
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('No code found, redirecting to auth code flow');
      await this.redirectToAuthCodeFlow(this.clientId);
    } else {
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('Code found, getting access token');
      const accessToken = await this.getAccessToken(this.clientId, this.code);
      await new Promise(resolve => setTimeout(resolve, 5000));
      localStorage.setItem('access_token', accessToken);
      console.log('Access token saved to local storage');
      const profile = await this.loginService.fetchProfile(accessToken);
      localStorage.setItem('user_id', profile.id);
      console.log('Profile fetched');
      this.router.navigate(['/songs']);
    }
  }

  async redirectToAuthCodeFlow(clientId: string) {
    const verifier = this.generateCodeVerifier(128);
    const challenge = await this.generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:4200/login");
    params.append("scope", "user-library-read playlist-modify-public");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  generateCodeVerifier(length: number) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  async generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
  }

  async getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:4200/login");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
  }



}
