/**
 * ByteSize — End-User Usability Evaluation (Adapted PSSUQ, Version 3)
 * Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman
 * Holy Angel University — School of Computing — BS Computer Science
 *
 * Generates the Google Form described in the thesis under
 * "Instruments → Instrument Structure and Scoring".
 *
 * HOW TO RUN
 *   1. Go to https://script.google.com  →  New project
 *   2. Delete the placeholder code, paste this whole file
 *   3. Run  createByteSizePSSUQForm
 *   4. Authorise when prompted (it needs permission to create Forms in your Drive)
 *   5. The edit + share URLs are printed to the Execution log
 *
 * INSTRUMENT SPEC (per the manuscript)
 *   Part I   16 items adapted from PSSUQ v3 (Lewis, 1992, 2002)
 *            SYSUSE    = items 1-6
 *            INFOQUAL  = items 7-12
 *            INTERQUAL = items 13-15
 *            Item 16   = summary satisfaction; Overall score only, no construct
 *   Part II  8 ByteSize-specific functional items, reported separately
 *   Part III 3 open-ended items, reported separately
 *
 *   Scale: 7-point, anchored 1 (Strongly Agree) .. 7 (Strongly Disagree), plus N/A.
 *   Source polarity is RETAINED, so a LOWER score denotes BETTER perceived usability.
 *   Scores are arithmetic means; N/A is omitted, never imputed.
 */

// ---------------------------------------------------------------------------
// CONFIGURATION — edit these before running
// ---------------------------------------------------------------------------

var CONFIG = {
  formTitle: 'ByteSize — End-User Usability Evaluation',

  researchers: 'Jaycen John C. Carreon, Rex Q. Nuqui, Justin Errol L. Priniel, and James Russel S. Sicat',

  // TODO: fill these in before distributing the form
  contactEmail: 'jaycenjohn14@gmail.com',
  adviserName: '[Adviser Name]',
  adviserEmail: '[adviser email]',

  // Set false to keep Part II on the same descending scale as Part I (recommended,
  // and what the manuscript implies). Set true only if your adviser wants Part II
  // to use the ascending 1 = Strongly Disagree .. 7 = Strongly Agree direction
  // used by the separate TECHNICAL instrument.
  partTwoUsesAscendingScale: false
};

// ---------------------------------------------------------------------------

var COLS = ['1', '2', '3', '4', '5', '6', '7', 'N/A'];

var LEGEND_DESC =
  '1 = Strongly Agree  ·  2 = Agree  ·  3 = Somewhat Agree  ·  4 = Neutral  ·  ' +
  '5 = Somewhat Disagree  ·  6 = Disagree  ·  7 = Strongly Disagree  ·  N/A = Not Applicable\n\n' +
  '⚠ Please note the direction of this scale: a LOWER number means a MORE POSITIVE rating. ' +
  'This is the original PSSUQ scale direction and it is intentional.';

var LEGEND_ASC =
  '1 = Strongly Disagree  ·  2 = Disagree  ·  3 = Somewhat Disagree  ·  4 = Neutral  ·  ' +
  '5 = Somewhat Agree  ·  6 = Agree  ·  7 = Strongly Agree  ·  N/A = Not Applicable\n\n' +
  '⚠ Please note: on this page a HIGHER number means a MORE POSITIVE rating.';


function createByteSizePSSUQForm() {
  var form = FormApp.create(CONFIG.formTitle);

  form.setTitle(CONFIG.formTitle)
      .setDescription(
        'Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman\n' +
        'A Thesis Project — School of Computing, Holy Angel University\n\n' +
        'Thank you for taking part in this evaluation. Please answer only after you have ' +
        'completed the assigned ByteSize tasks. This should take about 10 minutes.');

  // Privacy posture required by the manuscript: no email collected, no sign-in.
  // Google has changed the email-collection API more than once, so this is guarded.
  // If it warns, switch it off by hand in Settings > Responses before distributing.
  try {
    form.setCollectEmail(false);
  } catch (e) {
    Logger.log('WARNING: could not set "collect email" off programmatically (%s). ' +
               'Turn it OFF manually in Settings > Responses before sending the form.', e);
  }
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(
    'Your responses have been recorded. Thank you for helping evaluate ByteSize.\n\n' +
    'If you wish to withdraw your responses later, please contact the researchers at ' +
    CONFIG.contactEmail + '.');

  // These only apply to Google Workspace domains and throw on consumer accounts.
  try { form.setRequireLogin(false); } catch (e) {}
  try { form.setLimitOneResponsePerUser(false); } catch (e) {}

  // -------------------------------------------------------------------------
  // SECTION 1 — Data Privacy Notice & Informed Consent  (first page)
  // -------------------------------------------------------------------------

  form.addSectionHeaderItem()
      .setTitle('Data Privacy Notice and Informed Consent')
      .setHelpText(buildPrivacyNotice());

  var consentItem = form.addMultipleChoiceItem()
      .setTitle('Informed Consent')
      .setHelpText(
        'Please select one. You must consent in order to proceed to the questionnaire.')
      .setRequired(true);

  // -------------------------------------------------------------------------
  // SECTION 2 — Respondent Profile
  // -------------------------------------------------------------------------

  var pbProfile = form.addPageBreakItem()
      .setTitle('Respondent Profile')
      .setHelpText(
        'These questions describe the group of respondents as a whole. They are not used ' +
        'to identify you, and no item asks for your name, email, or any other ' +
        'directly identifying information.');

  form.addMultipleChoiceItem()
      .setTitle('Which best describes you?')
      .setChoiceValues([
        'Student',
        'Working professional',
        'Faculty or academic staff',
        'Self-employed / freelancer',
        'Prefer not to say'
      ])
      .showOtherOption(true)
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle('Age group')
      .setChoiceValues([
        '18-24', '25-34', '35-44', '45-54', '55 and above', 'Prefer not to say'
      ])
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle('How often do you work with large files (for example, archives, datasets, ' +
                'backups, media files, or long documents)?')
      .setChoiceValues([
        'Daily',
        'A few times a week',
        'A few times a month',
        'Rarely',
        'Never'
      ])
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('Which file compression tools have you used before, if any?')
      .setChoiceValues([
        'WinRAR', '7-Zip', 'WinZip', 'Built-in OS compression (Windows / macOS)',
        'Command-line tools (gzip, zip, tar, etc.)', 'None'
      ])
      .showOtherOption(true)
      .setRequired(false);

  form.addMultipleChoiceItem()
      .setTitle('Did you complete all four assigned ByteSize tasks — compressing a file, ' +
                'checking the reported result, restoring the original, and locating an ' +
                'earlier item in your processing history?')
      .setChoiceValues([
        'Yes, all four',
        'Most of them',
        'Only some of them',
        'No'
      ])
      .setRequired(true);

  // -------------------------------------------------------------------------
  // PART I — Adapted PSSUQ, Version 3   (16 items across 4 sections)
  // -------------------------------------------------------------------------

  form.addPageBreakItem()
      .setTitle('Part I-A — System Usefulness')
      .setHelpText(
        'Please rate how strongly you agree with each statement, based on the tasks you ' +
        'just performed in ByteSize.\n\n' + LEGEND_DESC);

  addGrid(form, 'System Usefulness (items 1-6)', [
    '1. Overall, I am satisfied with how easy it is to use ByteSize.',
    '2. It was simple to compress a file and restore it again using ByteSize.',
    '3. I was able to complete the assigned tasks quickly using ByteSize.',
    '4. I felt comfortable using ByteSize.',
    '5. It was easy to learn to use ByteSize.',
    '6. I believe I could become productive quickly using ByteSize.'
  ]);

  form.addPageBreakItem()
      .setTitle('Part I-B — Information Quality')
      .setHelpText(
        'These statements refer to the messages, labels, and result summaries ByteSize ' +
        'displayed to you.\n\n' + LEGEND_DESC);

  addGrid(form, 'Information Quality (items 7-12)', [
    '7. ByteSize gave error messages that clearly told me how to fix problems (for example, ' +
      'an unsupported file, a file over the size limit, or a failed upload).',
    '8. Whenever I made a mistake using ByteSize, I could recover easily and quickly.',
    '9. The information ByteSize provided — on-screen instructions, labels, and the ' +
      'compression and decompression result summaries — was clear.',
    '10. It was easy to find the information I needed, such as the original size, the ' +
      'compressed size, the compression ratio, and the space saved.',
    '11. The information was effective in helping me complete the assigned compression, ' +
      'restoration, and processing-history tasks.',
    '12. The organization of information on the ByteSize screens was clear.'
  ]);

  form.addPageBreakItem()
      .setTitle('Part I-C — Interface Quality')
      .setHelpText(
        'These statements refer to the look and feel of the ByteSize interface.\n\n' + LEGEND_DESC);

  addGrid(form, 'Interface Quality (items 13-15)', [
    '13. The interface of ByteSize was pleasant.',
    '14. I liked using the interface of ByteSize.',
    '15. ByteSize has all the functions and capabilities I expect it to have.'
  ]);

  form.addPageBreakItem()
      .setTitle('Part I-D — Overall Satisfaction')
      .setHelpText(LEGEND_DESC);

  addGrid(form, 'Overall (item 16)', [
    '16. Overall, I am satisfied with ByteSize.'
  ]);

  // -------------------------------------------------------------------------
  // PART II — ByteSize-Specific Functional Feedback  (8 items, reported separately)
  // -------------------------------------------------------------------------

  var partTwoLegend = CONFIG.partTwoUsesAscendingScale ? LEGEND_ASC : LEGEND_DESC;

  form.addPageBreakItem()
      .setTitle('Part II — ByteSize-Specific Functional Feedback')
      .setHelpText(
        'These statements cover features specific to ByteSize. They are reported separately ' +
        'and are not combined with the scores in Part I.\n\n' + partTwoLegend);

  addGrid(form, 'ByteSize-specific features (items 17-24)', [
    '17. I am confident that the file ByteSize restored is identical to the original file I compressed.',
    '18. The difference between the Fast, Balanced, and Maximum compression presets was clear to me.',
    '19. The space saving that ByteSize reported after compression was easy to understand.',
    '20. The processing history made it easy to review the files I had already compressed or restored.',
    '21. It was easy to manage my stored compressed results, including downloading a result ' +
      'again or removing one.',
    '22. The analytics and report views gave me a useful summary of my compression activity.',
    '23. Having separate pages for compression and decompression made the system easier to use, not harder.',
    '24. I would be willing to use ByteSize on my own files.'
  ]);

  // -------------------------------------------------------------------------
  // PART III — Open-Ended Feedback
  // -------------------------------------------------------------------------

  form.addPageBreakItem()
      .setTitle('Part III — Open-Ended Feedback')
      .setHelpText(
        'Please answer in your own words. There are no right or wrong answers, and you may ' +
        'skip any question you prefer not to answer.');

  form.addParagraphTextItem()
      .setTitle('Which features of ByteSize did you find most useful, and why?')
      .setRequired(false);

  form.addParagraphTextItem()
      .setTitle('What difficulties, confusing parts, or errors did you encounter while using ByteSize?')
      .setRequired(false);

  form.addParagraphTextItem()
      .setTitle('What further suggestions do you have for improving ByteSize?')
      .setRequired(false);

  // -------------------------------------------------------------------------
  // Consent gating — non-consenting respondents never reach the items
  // -------------------------------------------------------------------------

  consentItem.setChoices([
    consentItem.createChoice(
      'I have read and understood the Data Privacy Notice above. I voluntarily consent to ' +
      'participate in this study.',
      pbProfile),
    consentItem.createChoice(
      'I do not consent to participate.',
      FormApp.PageNavigationType.SUBMIT)
  ]);

  // -------------------------------------------------------------------------

  Logger.log('=================================================');
  Logger.log('FORM CREATED');
  Logger.log('Edit URL:    %s', form.getEditUrl());
  Logger.log('Share URL:   %s', form.getPublishedUrl());
  Logger.log('=================================================');
  Logger.log('Before distributing, remember to:');
  Logger.log('  1. Fill in adviserName / adviserEmail in CONFIG and re-run, or edit in the form');
  Logger.log('  2. Confirm Settings > Responses > "Collect email addresses" is OFF');
  Logger.log('  3. Link a response spreadsheet (Responses tab > Link to Sheets)');

  return form;
}


/**
 * Adds one grid item: rows are questionnaire statements, columns are 1-7 plus N/A.
 * A grid is used rather than individual scale items because Google Forms scale items
 * cannot carry an N/A option, and the instrument requires one.
 */
function addGrid(form, title, rows) {
  return form.addGridItem()
      .setTitle(title)
      .setRows(rows)
      .setColumns(COLS)
      .setRequired(true);
}


/**
 * The Data Privacy Notice and informed-consent text, drawn from the
 * "Ethical Consideration" section of the manuscript.
 */
function buildPrivacyNotice() {
  return [
    'STUDY',
    'Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman ' +
      '("ByteSize"), a thesis submitted to the School of Computing, Holy Angel University, in ' +
      'partial fulfillment of the requirements for the degree of Bachelor of Science in Computer Science.',
    '',
    'RESEARCHERS',
    CONFIG.researchers,
    'Thesis Adviser: ' + CONFIG.adviserName,
    '',
    'PURPOSE',
    'You are invited to evaluate the usability of the ByteSize demonstration interface after ' +
      'completing a fixed set of tasks: compressing a file, checking the reported result, ' +
      'restoring the original file, and locating an earlier item in your processing history. ' +
      'Your responses will help the researchers assess how understandable and usable the ' +
      'system is for general users.',
    '',
    'WHAT PARTICIPATION INVOLVES',
    'Answering this questionnaire, which takes approximately 10 minutes. It contains 24 rating ' +
      'statements and 3 optional open-ended questions.',
    '',
    'VOLUNTARY PARTICIPATION',
    'Participation is entirely voluntary. You may decline to answer any item, and you may ' +
      'withdraw at any point without penalty and without giving a reason. If you withdraw, ' +
      'your data will be removed. To withdraw after submitting, contact the researchers at ' +
      CONFIG.contactEmail + '.',
    '',
    'DATA WE COLLECT',
    'Only the minimum data necessary for the study: your questionnaire ratings, your optional ' +
      'written comments, and general profile information (respondent type, age group, and how ' +
      'often you work with large files). No sensitive personal information is collected. ' +
      'This form does NOT collect your email address and does NOT require you to sign in, so ' +
      'no directly identifying field is gathered at the point of response.',
    '',
    'ANONYMITY AND CONFIDENTIALITY',
    'Responses are reported in aggregate. No participant is identified by name in the ' +
      'manuscript or in any appendix, and individual responses are not disclosed to other ' +
      'participants, to faculty, or to third parties. After collection closes, responses are ' +
      'exported and analyzed offline. The working copy is stored on a password-protected ' +
      'machine accessible only to the researchers, and is destroyed after the study is ' +
      'completed and defended.',
    '',
    'THIRD-PARTY PROCESSORS (DISCLOSED BEFORE CONSENT)',
    'Two third-party services are involved, both operating infrastructure outside the ' +
      "researchers' control:",
    '  • Google Forms — receives and stores your questionnaire responses.',
    '  • Supabase — hosts the demonstration system\'s account records, processing history, and ' +
      'stored compressed results.',
    'Your uploaded original files and decompressed output are never written to persistent ' +
      'storage; they exist in server memory only for the duration of the request. No file ' +
      'contents belonging to you are used as research data.',
    '',
    'DATA PRIVACY ACT COMPLIANCE',
    'The handling of your data conforms to Republic Act No. 10173, the Data Privacy Act of ' +
      '2012. Data is used solely for the declared research purpose. Under the Act you have the ' +
      'right to be informed, to object, to access your data, to correct inaccurate data, to ' +
      'erasure or blocking, and to damages. To exercise any of these rights, contact the ' +
      'researchers at ' + CONFIG.contactEmail + '.',
    '',
    'QUESTIONS',
    'For questions about this study, contact the researchers at ' + CONFIG.contactEmail +
      ' or the thesis adviser at ' + CONFIG.adviserEmail + '.',
    '',
    'By selecting "I voluntarily consent to participate" below, you confirm that you are at ' +
      'least 18 years old, that you have read and understood this notice, and that you agree ' +
      'to take part. If you do not consent, select the second option and the form will end ' +
      'without recording any questionnaire responses.'
  ].join('\n');
}
