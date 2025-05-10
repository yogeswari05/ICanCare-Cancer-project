const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const fs = require("fs");
const path = require("path");

const credentials = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../credentials.json"))
);

const redirectUri =
  credentials.web.redirect_uris && credentials.web.redirect_uris[0];
if (!redirectUri) {
  throw new Error("Redirect URI is not defined in the credentials.json file");
}

const oAuth2Client = new OAuth2(
  credentials.web.client_id,
  credentials.web.client_secret,
  redirectUri
);

const getAuthUrl = () => {
   const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
   ];
   
   return oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
   });
};

const getTokensFromCode = async (code) => {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
};

if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
  oAuth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

const createGoogleMeet = async (summary, description, startTime, endTime) => {
   if (!oAuth2Client.credentials.refresh_token) {
      throw new Error("Access token is not available");
   }

   const formatDateTime = (dateTimeStr) => {
      const date = new Date(dateTimeStr);
      return date.toISOString();
   };
   const formattedStartTime =
      startTime.includes("T") && startTime.includes("Z")
         ? startTime
         : formatDateTime(startTime);
   const formattedEndTime =
      endTime.includes("T") && endTime.includes("Z")
         ? endTime
         : formatDateTime(endTime);

   const event = {
      summary,
      description,
      start: {
         dateTime: formattedStartTime,
         timeZone: "America/Los_Angeles",
      },
      end: {
         dateTime: formattedEndTime,
         timeZone: "America/Los_Angeles",
      },
      conferenceData: {
         createRequest: {
         requestId: `meet-${Date.now()}`,
         conferenceSolutionKey: {
            type: "hangoutsMeet",
         },
         },
      },
   };

   try {
      const response = await calendar.events.insert({
         calendarId: "primary",
         requestBody: event,
         conferenceDataVersion: 1,
      });
      return response.data.hangoutLink;
   } catch (error) {
      console.error("Error creating Google Meet:", error);
      throw new Error("Error creating Google Meet");      
   }
};

const isAuthenticated = () => {
   return !!oAuth2Client.credentials.refresh_token;
};

module.exports = {
   getAuthUrl,
   getTokensFromCode,
   createGoogleMeet,
   isAuthenticated
};