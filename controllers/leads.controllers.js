import fs from 'fs';
import csv from 'csv-parser';
import axios from 'axios';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';

const report = {
  totalLeadsRead: 0,
  totalLeadsCreated: 0,
  totalLeadsUpdated: 0,
  totalLeadsDeleted: 0,
};

// Config CSV
const csvWriter = createObjectCsvWriter({
  path: path.join(process.cwd(), './assets/report.csv'),
  header: [
    { id: 'metric', title: 'Metric' },
    { id: 'value', title: 'Value' }
  ],
  append: false
});

// Function to save the report in a new CSV file
const saveReportToCsv = async () => {
  // Delete the existing CSV file if it exists
  const csvFilePath = path.join(process.cwd(), './assets/report.csv');
  if (fs.existsSync(csvFilePath)) {
    fs.unlinkSync(csvFilePath);
  }

  // Create a new CSV file and write the records
  const records = [
    { metric: 'Total Leads Read', value: report.totalLeadsRead },
    { metric: 'Total Leads Created', value: report.totalLeadsCreated },
    { metric: 'Total Leads Updated', value: report.totalLeadsUpdated },
    { metric: 'Total Leads Deleted', value: report.totalLeadsDeleted },
  ];

  await csvWriter.writeRecords(records);
};

export const createLeads = async (req, res) => {

  const mandatoryFields = ['First Name', 'Last Name', 'Email', 'Company', 'Title', 'Lead Source', 'Lead Status'];
  const zohoFieldMap = {
    'First Name': 'First_Name',
    'Last Name': 'Last_Name',
    'Email': 'Email',
    'Company': 'Company',
    'Title': 'Title',
    'Lead Source': 'Lead_Source',
    'Lead Status': 'Lead_Status'
  };

  let validLeads = [];

  // Read and process the leads.csv file
  fs.createReadStream('./assets/leads.csv')
    .pipe(csv())
    .on('data', (row) => {
      const isValid = mandatoryFields.every(field => row[field] && row[field].trim() !== '');

      if (isValid) {
        let formattedLead = {};
        mandatoryFields.forEach(field => {
          const zohoField = zohoFieldMap[field];
          formattedLead[zohoField] = row[field];
        });

        validLeads.push(formattedLead);
      }
    })
    .on('end', async () => {

      // Format valid leads in the format required by Zoho CRM
      const formattedLeads = {
        data: validLeads
      };

      try {
        const response = await axios.post(`${process.env.BASE_URL}/Leads`, formattedLeads, {
          headers: {
            'Authorization': `Zoho-oauthtoken ${req.accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        report.totalLeadsCreated += response.data.data.length;
        report.totalLeadsRead += response.data.data.length;
        await saveReportToCsv();

        // Extract the IDs of the created leads
        const createdLeads = response.data.data;
        const leadIds = createdLeads.map(lead => lead.details.id);
        res.json({ leadIds });

      } catch (error) {
        console.error('Error when creating leads:', error.response.data);
        res.status(500).json({ error: 'Error when creating leads' });
      }
    });

}

export const updateLeads = async (req, res) => {

  const accessToken = req.accessToken;
  let status = 204;
  let searchResponse;
  let count = 0;

  try {

    while(status !== 200){
      searchResponse = await axios.get(`${process.env.BASE_URL}/Leads/search`, {
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          criteria: '(Lead_Source:equals:Advertisement)'
        }
      });
      status = searchResponse.status;
      count++
    };

    const leadsToUpdate = searchResponse.data.data;

    if (!leadsToUpdate || leadsToUpdate.length === 0) {
      return res.status(404).json({ message: 'No leads were found with Lead Source "Advertisement"' });
    }

    const updatedLeads = leadsToUpdate.map(lead => ({
      id: lead.id,
      Lead_Status: 'Contacted'
    }));

    const updateResponse = await axios.put(`${process.env.BASE_URL}/Leads`, {
      data: updatedLeads
    }, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    report.totalLeadsUpdated += updateResponse.data.data.length;
    await saveReportToCsv();
    res.json(updateResponse.data);

  } catch (error) {
    console.error('Error updating Lead Status:', error.response.data);
    res.status(500).json({ error: 'Error updating Lead Status:' });
  }
}

export const deleteLeads = async (req, res) => {
  const accessToken = req.accessToken;

  try {

    const searchResponse = await axios.get(`${process.env.BASE_URL}/Leads/search`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        criteria: '(Lead_Source:equals:Facebook)'
      }
    });

    const leadsToDelete = searchResponse.data.data;

    if (!leadsToDelete || leadsToDelete.length === 0) {
      return res.status(404).json({ message: 'No leads were found with Lead Source “Facebook”' });
    }

    const leadIds = leadsToDelete.map(lead => lead.id);

    const ids = leadIds.join(',');
    const deleteResponse = await axios.delete(`${process.env.BASE_URL}/Leads?ids=${ids}`, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    report.totalLeadsDeleted += deleteResponse.data.data.length;
    await saveReportToCsv();
    res.json({ message: 'Leads successfully eliminated', deletedLeads: leadIds });

  } catch (error) {
    console.error('Error when eliminating leads:', error.response.data);
    res.status(500).json({ error: 'Error when eliminating leads' });
  }
}