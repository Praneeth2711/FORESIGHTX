export type DecisionId = 'A' | 'B' | 'C';

export interface OutcomeMetrics {
  title: string;
  summary: string;
  operationalImpact: string;
  scheduleImpact: string;
  attendeeExperience: string;
  implementationReqs: string;
  tradeOffs: string[];
  assumptions: string[];
  failurePoints: string[];
}

export interface DecisionPath {
  id: DecisionId;
  label: string;
  base: OutcomeMetrics;
  withDisruption: OutcomeMetrics;
}

export const calculateOutcome = (
  path: DecisionPath,
  internetLost: boolean
): OutcomeMetrics => {
  return internetLost ? path.withDisruption : path.base;
};

export const SCENARIO_DATA: Record<DecisionId, DecisionPath> = {
  A: {
    id: 'A',
    label: 'Delay the Event',
    base: {
      title: 'Schedule pushed by 30m',
      summary: 'Attendees wait in the main hall. The entire subsequent schedule is shifted.',
      operationalImpact: 'Moderate overhead. Catering and staff schedules must be immediately adjusted.',
      scheduleImpact: 'All subsequent sessions lose 5-10 minutes, or the day ends 30 minutes late.',
      attendeeExperience: 'Initial frustration, but expectations are reset. Satisfaction holds at 85%.',
      implementationReqs: 'Immediate PA announcements and app push notifications.',
      tradeOffs: ['Sacrifices schedule integrity for content continuity', 'Increases catering overtime costs'],
      assumptions: ['Speaker will definitely arrive in 30 mins', 'Venue allows late closing'],
      failurePoints: ['Speaker delayed further', 'Attendees leave during the wait']
    },
    withDisruption: {
      title: 'Information Blackout',
      summary: 'Attendees wait in silence without Wi-Fi or digital updates.',
      operationalImpact: 'Severe. Staff must physically inform attendees without digital comms.',
      scheduleImpact: 'Identical 30-minute delay, but feels longer to attendees.',
      attendeeExperience: 'High frustration. Inability to check emails while waiting drops satisfaction to 55%.',
      implementationReqs: 'Manual PA announcements and staff deployment to the floor.',
      tradeOffs: ['Massive brand damage vs saving the keynote'],
      assumptions: ['PA system does not rely on the down network'],
      failurePoints: ['Total loss of crowd control', 'Negative social media backlash later']
    }
  },
  B: {
    id: 'B',
    label: 'Alternative Activity',
    base: {
      title: 'Seamless Q&A Transition',
      summary: 'Instantly pivot to an interactive audience Q&A with available panelists.',
      operationalImpact: 'High agility required. Moderators must step up without preparation.',
      scheduleImpact: 'Schedule maintained perfectly. Keynote shifted to closing slot.',
      attendeeExperience: 'Engagement remains high (92%). Attendees appreciate the spontaneous value.',
      implementationReqs: 'Slido/digital Q&A activation and immediate stage reconfiguration.',
      tradeOffs: ['Requires highly capable available staff', 'Original keynote loses peak morning energy'],
      assumptions: ['Digital Q&A tools are ready', 'Audience is willing to participate'],
      failurePoints: ['Dead air if audience asks no questions', 'Panelists unable to carry the hour']
    },
    withDisruption: {
      title: 'Offline Networking Pivot',
      summary: 'Digital Q&A tools fail. Forced pivot to offline localized networking.',
      operationalImpact: 'Chaos minimized by shifting burden to attendees. Staff facilitates groups.',
      scheduleImpact: 'Schedule maintained, but perceived value of the slot drops.',
      attendeeExperience: 'Mixed. Extroverts thrive, introverts disengage. Satisfaction at 78%.',
      implementationReqs: 'Staff must physically direct audience to form discussion pods.',
      tradeOffs: ['Zero tech reliance vs low structured value'],
      assumptions: ['Audience is willing to network'],
      failurePoints: ['Attendees simply leave for coffee', 'Space is not conducive to networking']
    }
  },
  C: {
    id: 'C',
    label: 'Backup Speaker',
    base: {
      title: 'Content Substitution',
      summary: 'Original keynote cancelled. Secondary speaker takes the main stage.',
      operationalImpact: 'Low friction. Stage manager calls the backup from the green room.',
      scheduleImpact: 'Schedule maintained perfectly.',
      attendeeExperience: 'Noticeable disappointment (12% early departure). Satisfaction at 80%.',
      implementationReqs: 'Backup speaker cloud slides loaded to main deck.',
      tradeOffs: ['Guaranteed content delivery vs loss of marquee draw'],
      assumptions: ['Backup speaker is prepared and present', 'Slides are accessible'],
      failurePoints: ['Backup speaker underperforms', 'Audience rejects the substitution']
    },
    withDisruption: {
      title: 'Impromptu Offline Talk',
      summary: 'Backup speaker cannot access cloud slides. Delivers unassisted talk.',
      operationalImpact: 'High stress for the speaker. AV team cannot assist.',
      scheduleImpact: 'Schedule maintained, but presentation is truncated.',
      attendeeExperience: 'Appreciation for the effort, but low educational value. Satisfaction at 65%.',
      implementationReqs: 'Whiteboards or flip charts rushed to stage.',
      tradeOffs: ['Raw authenticity vs polished professional delivery'],
      assumptions: ['Speaker can present without visual aids'],
      failurePoints: ['Speaker refuses to go on without slides', 'Content is incomprehensible without visuals']
    }
  }
};
