import { Component } from '@angular/core';
import { UserAgentCard } from './user-agent-card/user-agent-card';
import { ProfileCard } from './profile-card/profile-card';
import { SettingsCard } from './settings-card/settings-card';

@Component({
  selector: 'app-settings',
  imports: [UserAgentCard, ProfileCard, SettingsCard],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {}
