/**
 * ByteSize — Technical Evaluation Instrument (ISO/IEC 5055-aligned)
 * Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman
 * Holy Angel University — School of Computing — BS Computer Science
 *
 * Generates the Google Form described in the thesis under
 * "Instruments → Technical Evaluation Framework".
 *
 * HOW TO RUN
 *   1. Go to https://script.google.com  →  New project
 *   2. Delete the placeholder code, paste this whole file
 *   3. Run  createByteSizeTechnicalForm
 *   4. Authorise when prompted
 *   5. The edit + share URLs are printed to the Execution log
 *
 * ============================ SCALE WARNING ============================
 * This instrument runs the OPPOSITE direction to the end-user PSSUQ form.
 *   Technical (this form): 1 = Strongly Disagree .. 7 = Strongly Agree
 *                          HIGHER is better.
 *   End-user (PSSUQ form): 1 = Strongly Agree .. 7 = Strongly Disagree
 *                          LOWER is better.
 * Never pool scores across the two instruments.
 * =======================================================================
 *
 * INSTRUMENT SPEC (per the manuscript)
 *   Four ISO/IEC 5055-aligned constructs:
 *     Reliability (REL)  ·  Security (SEC)
 *     Performance Efficiency (PE)  ·  Maintainability (MNT)
 *   One ByteSize-specific construct, NOT combined with the four:
 *     Algorithm Transparency and Technical Correctness (ALG)
 *
 *   N/A means "Not Applicable or Insufficient Evidence".
 *
 * RESPONDENT ROUTING
 *   Algorithm experts (3-5)  -> REL, SEC, PE, ALG, MNT
 *   CS students (10-15)      -> MNT only
 *   The manuscript restricts student judgment to maintainability evidence and
 *   declines to generalise it further, so the role question branches. This is
 *   why MNT is ordered last: after the branch the flow is linear for both paths.
 */

// ---------------------------------------------------------------------------
// CONFIGURATION — edit these before running
// ---------------------------------------------------------------------------

var CONFIG = {
  formTitle: 'ByteSize — Technical Evaluation (ISO/IEC 5055-Aligned)',

  researchers: 'Jaycen John C. Carreon, Rex Q. Nuqui, Justin Errol L. Priniel, and James Russel S. Sicat',

  // TODO: fill these in before distributing the form
  contactEmail: 'jaycenjohn14@gmail.com',
  adviserName: '[Adviser Name]',
  adviserEmail: '[adviser email]',

  // Where evaluators access the material under review. TODO: fill in.
  repositoryUrl: '[repository or source bundle URL]',
  documentationUrl: '[technical documentation URL]'
};

// ---------------------------------------------------------------------------

var COLS = ['1', '2', '3', '4', '5', '6', '7', 'N/A'];

var LEGEND =
  '1 = Strongly Disagree  ·  2 = Disagree  ·  3 = Somewhat Disagree  ·  4 = Neutral  ·  ' +
  '5 = Somewhat Agree  ·  6 = Agree  ·  7 = Strongly Agree\n' +
  'N/A = Not Applicable, or Insufficient Evidence to judge\n\n' +
  'A HIGHER number denotes a MORE FAVOURABLE technical evaluation. ' +
  'Please use N/A freely rather than guessing — an honest "insufficient evidence" ' +
  'is more useful to this study than a speculative rating.';


function createByteSizeTechnicalForm() {
  var form = FormApp.create(CONFIG.formTitle);

  form.setTitle(CONFIG.formTitle)
      .setDescription(
        'Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman\n' +
        'A Thesis Project — School of Computing, Holy Angel University\n\n' +
        'Please answer only after reviewing the source code, the technical documentation, the ' +
        'automated test evidence, and the demonstrated system behaviour.');

  // Google's own "collect email" auto-captures the signed-in account, which forces every
  // evaluator to have a Google account and grabs the address before the privacy notice is
  // read. Identity is instead gathered as explicit, consented fields AFTER the notice, so
  // this stays off and sign-in is never required.
  try {
    form.setCollectEmail(false);
  } catch (e) {
    Logger.log('WARNING: could not set "collect email" off programmatically (%s). ' +
               'Turn it OFF manually in Settings > Responses before sending the form.', e);
  }
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(
    'Your evaluation has been recorded. Thank you for reviewing ByteSize.\n\n' +
    'If you wish to withdraw your responses later, please contact the researchers at ' +
    CONFIG.contactEmail + '.');

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
      .setHelpText('Please select one. You must consent in order to proceed to the evaluation.')
      .setRequired(true);

  // -------------------------------------------------------------------------
  // SECTION 2 — Evaluator Profile  (carries the role branch)
  // -------------------------------------------------------------------------

  var pbProfile = form.addPageBreakItem()
      .setTitle('Evaluator Profile')
      .setHelpText(
        'Your name and email are collected so the researchers can verify evaluator ' +
        'eligibility, follow up on a finding that needs clarification, and honour a ' +
        'withdrawal request. They are separated from your ratings before analysis and are ' +
        'never published. The remaining questions describe the panel as a whole and ' +
        'determine which sections you are asked to complete.');

  form.addTextItem()
      .setTitle('Full name')
      .setRequired(true);

  form.addTextItem()
      .setTitle('Email address')
      .setValidation(FormApp.createTextValidation()
          .setHelpText('Please enter a valid email address.')
          .requireTextIsEmail()
          .build())
      .setRequired(true);

  form.addTextItem()
      .setTitle('Affiliation or organisation')
      .setHelpText('Used only to establish evaluator background. Not published.')
      .setRequired(false);

  var roleItem = form.addMultipleChoiceItem()
      .setTitle('Which describes your role in this evaluation?')
      .setHelpText(
        'This determines the sections you will see. Algorithm experts evaluate all five ' +
        'constructs. Computer science students evaluate maintainability, which is the ' +
        'construct their review is designed to inform.')
      .setRequired(true);

  form.addCheckboxItem()
      .setTitle('Which material did your review draw on?')
      .setChoiceValues([
        'Source code inspection',
        'Technical documentation',
        'Automated test evidence',
        'Demonstrated system behaviour'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('Your experience with data structures and algorithms')
      .setChoiceValues([
        'Coursework only',
        'Less than 2 years of practice',
        '2 to 5 years',
        '6 to 10 years',
        'More than 10 years'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('Your familiarity with data compression specifically')
      .setChoiceValues([
        'None',
        'Basic — I know how Huffman coding works in principle',
        'Working — I have implemented or maintained compression code',
        'Expert — compression is a primary area of my work or research'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem()
      .setTitle('Approximately how much time did you spend reviewing the material?')
      .setChoiceValues([
        'Under 30 minutes',
        '30 minutes to 1 hour',
        '1 to 3 hours',
        'More than 3 hours'
      ])
      .setRequired(false);

  // -------------------------------------------------------------------------
  // ISO/IEC 5055-ALIGNED CONSTRUCTS
  // -------------------------------------------------------------------------

  var pbReliability = form.addPageBreakItem()
      .setTitle('Part I — Reliability')
      .setHelpText(
        'The degree to which the implementation behaves correctly and predictably, ' +
        'including on error paths and at boundary conditions.\n\n' + LEGEND);

  addGrid(form, 'Reliability (REL 1-7)', [
    'REL-1. The implementation handles error conditions explicitly rather than allowing them ' +
      'to propagate as unhandled exceptions.',
    'REL-2. Resources such as file handles, buffers, and memory allocations are released ' +
      'reliably on every execution path, including error paths.',
    'REL-3. Boundary conditions are handled correctly, including empty files, single-symbol ' +
      'inputs, and files at the maximum supported size.',
    'REL-4. The code validates its internal assumptions — for example tree well-formedness ' +
      'and table bounds — rather than assuming them.',
    'REL-5. The Python reference implementation and the C++17 accelerator produce ' +
      'byte-identical containers and decode each other’s output exactly, as the ' +
      'automated checks require.',
    'REL-6. The automated test evidence is sufficient to support a claim of reliable operation.',
    'REL-7. Overall, I judge the reliability of the ByteSize implementation to be satisfactory.'
  ]);

  var pbSecurity = form.addPageBreakItem()
      .setTitle('Part II — Security')
      .setHelpText(
        'The degree to which the implementation protects against malformed input, unsafe ' +
        'memory handling, and improper disclosure or access.\n\n' + LEGEND);

  addGrid(form, 'Security (SEC 1-7)', [
    'SEC-1. Untrusted input — uploaded file contents, file names, and declared size fields — ' +
      'is validated before use.',
    'SEC-2. The decoder is robust against malformed or deliberately crafted container files.',
    'SEC-3. Buffer and index handling in the C++17 accelerator is bounds-safe.',
    'SEC-4. Credentials and API keys are kept out of the source code, and configuration is ' +
      'externalised.',
    'SEC-5. Access to stored compressed results and processing history is properly restricted ' +
      'to the owning account or an administrator.',
    'SEC-6. Error messages and logs avoid disclosing sensitive internal detail.',
    'SEC-7. Overall, I judge the security posture of the ByteSize implementation to be satisfactory.'
  ]);

  var pbPerformance = form.addPageBreakItem()
      .setTitle('Part III — Performance Efficiency')
      .setHelpText(
        'The degree to which the implementation uses time and memory proportionately for the ' +
        'workloads it targets.\n\n' + LEGEND);

  addGrid(form, 'Performance Efficiency (PE 1-7)', [
    'PE-1. The algorithmic complexity of the three-tier scan is appropriate for the input ' +
      'sizes the system targets.',
    'PE-2. The data structures used for frequency counting and candidate selection suit their ' +
      'access patterns.',
    'PE-3. Memory use is proportionate; the implementation avoids retaining large intermediate ' +
      'structures longer than necessary.',
    'PE-4. Loops and hot paths avoid redundant recomputation.',
    'PE-5. The C++17 accelerator delivers a performance benefit that justifies the added cost ' +
      'of maintaining two implementations.',
    'PE-6. The 100-megabyte per-file ceiling is a reasonable engineering limit given the ' +
      'system’s design.',
    'PE-7. Overall, I judge the performance efficiency of the ByteSize implementation to be ' +
      'satisfactory.'
  ]);

  // -------------------------------------------------------------------------
  // BYTESIZE-SPECIFIC CONSTRUCT — never combined with the four above
  // -------------------------------------------------------------------------

  var pbAlgorithm = form.addPageBreakItem()
      .setTitle('Part IV — Algorithm Transparency and Technical Correctness')
      .setHelpText(
        'This construct is specific to ByteSize and is reported separately. It is never ' +
        'combined with the four ISO/IEC 5055-aligned categories.\n\n' + LEGEND);

  addGrid(form, 'Algorithm Transparency and Technical Correctness (ALG 1-11)', [
    'ALG-1. Tier 1 byte-frequency analysis is implemented correctly, and its role in the ' +
      'pipeline is clear from the source.',
    'ALG-2. Tier 2 sequence (n-gram) analysis is implemented correctly, and its ' +
      'candidate-generation logic is traceable.',
    'ALG-3. Tier 3 structural-token (whole-word) analysis is implemented correctly, and its ' +
      'tokenisation rules are explicit.',
    'ALG-4. The Bit Cost Decision Engine’s admission criterion is mathematically sound: a ' +
      'candidate enters the alphabet only when its projected bit savings exceed the cost of ' +
      'storing it.',
    'ALG-5. Candidates rejected by the Bit Cost Decision Engine are correctly represented ' +
      'through their underlying byte symbols, with no loss of information.',
    'ALG-6. Structural block growth is bounded, and the conditions governing it are evident ' +
      'from the code.',
    'ALG-7. The profitability audit correctly verifies that admitted patterns deliver the ' +
      'savings the engine projected.',
    'ALG-8. The dynamic-programming optimal parsing produces a genuinely optimal segmentation ' +
      'under the stated cost model.',
    'ALG-9. Container selection, including the size guard and raw-storage fallback, is correct ' +
      'and prevents output larger than the input.',
    'ALG-10. Exact lossless reconstruction is demonstrated convincingly, and SHA-256 digest ' +
      'verification on every trial is adequate evidence of it.',
    'ALG-11. Overall, the algorithm is transparent enough that an independent reviewer could ' +
      'follow its logic from the source.'
  ]);

  // -------------------------------------------------------------------------
  // MAINTAINABILITY — ordered last so the student branch flows linearly
  // -------------------------------------------------------------------------

  var pbMaintainability = form.addPageBreakItem()
      .setTitle('Part V — Maintainability')
      .setHelpText(
        'The degree to which a developer other than the original authors could read, ' +
        'understand, and extend this codebase.\n\n' + LEGEND);

  addGrid(form, 'Maintainability (MNT 1-9)', [
    'MNT-1. The source code is readable, and its intent is clear without needing to consult ' +
      'the authors.',
    'MNT-2. Naming of functions, variables, and modules is consistent and descriptive.',
    'MNT-3. The code is adequately documented, through both inline comments and the ' +
      'accompanying technical documentation.',
    'MNT-4. The system is modular; responsibilities are separated rather than concentrated in ' +
      'large multi-purpose functions.',
    'MNT-5. Coupling between the compression engine and the web application layer is low ' +
      'enough that either could change independently.',
    'MNT-6. Individual functions and modules are of manageable size and complexity.',
    'MNT-7. Duplicated logic is avoided; shared behaviour is factored into common routines.',
    'MNT-8. A developer other than the original authors could maintain and extend this codebase.',
    'MNT-9. Overall, I judge the maintainability of the ByteSize implementation to be satisfactory.'
  ]);

  // -------------------------------------------------------------------------
  // Open-ended
  // -------------------------------------------------------------------------

  form.addPageBreakItem()
      .setTitle('Part VI — Open-Ended Technical Feedback')
      .setHelpText(
        'Please answer in your own words. Comment only on what your review actually covered; ' +
        'you may skip any question.');

  form.addParagraphTextItem()
      .setTitle('What are the principal technical strengths of the implementation?')
      .setRequired(false);

  form.addParagraphTextItem()
      .setTitle('What technical weaknesses, risks, or defects did you identify?')
      .setHelpText(
        'Please be specific where you can — a file, function, or construct name helps the ' +
        'researchers act on the finding.')
      .setRequired(false);

  form.addParagraphTextItem()
      .setTitle('What specific changes would you recommend before this system is presented as complete?')
      .setRequired(false);

  // -------------------------------------------------------------------------
  // Wire up consent gating and role branching
  // -------------------------------------------------------------------------

  consentItem.setChoices([
    consentItem.createChoice(
      'I have read and understood the Data Privacy Notice above. I voluntarily consent to ' +
      'take part in this evaluation.',
      pbProfile),
    consentItem.createChoice(
      'I do not consent to participate.',
      FormApp.PageNavigationType.SUBMIT)
  ]);

  // Only this question carries navigation, so the branch is unambiguous.
  roleItem.setChoices([
    roleItem.createChoice(
      'Algorithm expert — a professional with a background in data structures and compression',
      pbReliability),
    roleItem.createChoice(
      'Computer science student — second year or higher, with data structures and algorithms ' +
      'coursework completed',
      pbMaintainability)
  ]);

  // Explicit, so later edits in the Forms UI do not silently reroute the expert path.
  pbReliability.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  pbSecurity.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  pbPerformance.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  pbAlgorithm.setGoToPage(FormApp.PageNavigationType.CONTINUE);
  pbMaintainability.setGoToPage(FormApp.PageNavigationType.CONTINUE);

  // -------------------------------------------------------------------------

  Logger.log('=================================================');
  Logger.log('FORM CREATED');
  Logger.log('Edit URL:    %s', form.getEditUrl());
  Logger.log('Share URL:   %s', form.getPublishedUrl());
  Logger.log('=================================================');
  Logger.log('Before distributing, remember to:');
  Logger.log('  1. Fill in adviserName, adviserEmail, repositoryUrl, documentationUrl in CONFIG');
  Logger.log('  2. Confirm Settings > Responses > "Collect email addresses" is OFF');
  Logger.log('  3. Walk BOTH branches in preview: expert sees REL/SEC/PE/ALG/MNT,');
  Logger.log('     student sees MNT only');
  Logger.log('  4. Link a response spreadsheet (Responses tab > Link to Sheets)');

  return form;
}


/**
 * Adds one grid item: rows are statements, columns are 1-7 plus N/A.
 * A grid is used rather than individual scale items because Google Forms scale
 * items cannot carry an N/A column, and "Insufficient Evidence" must be recordable.
 */
function addGrid(form, title, rows) {
  return form.addGridItem()
      .setTitle(title)
      .setRows(rows)
      .setColumns(COLS)
      .setRequired(true);
}


/**
 * Data Privacy Notice and informed consent, matching the end-user form and drawn
 * from the "Ethical Consideration" section of the manuscript.
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
    'You are invited to evaluate the technical quality of the ByteSize implementation against ' +
      'the Reliability, Security, Performance Efficiency, and Maintainability characteristics ' +
      'relevant to ISO/IEC 5055, together with a ByteSize-specific assessment of algorithm ' +
      'transparency and technical correctness. Your judgment will be used as evidence of the ' +
      'quality of the underlying implementation.',
    '',
    'THIS IS NOT A CERTIFICATION',
    'This questionnaire is researcher-developed and aligned with ISO/IEC 5055 characteristics. ' +
      'It is not an official ISO/IEC 5055 questionnaire, not a certification instrument, and ' +
      'not a substitute for automated source-code measurement.',
    '',
    'WHAT PARTICIPATION INVOLVES',
    'Reviewing the source code, technical documentation, automated test evidence, and ' +
      'demonstrated system behaviour, then completing this questionnaire. The questionnaire ' +
      'itself takes roughly 15 to 20 minutes; the review preceding it takes longer and is at ' +
      'your discretion.',
    'Source code: ' + CONFIG.repositoryUrl,
    'Technical documentation: ' + CONFIG.documentationUrl,
    '',
    'VOLUNTARY PARTICIPATION',
    'Participation is entirely voluntary. You may decline to answer any item, and you may ' +
      'withdraw at any point without penalty and without giving a reason. If you withdraw, ' +
      'your data will be removed. To withdraw after submitting, contact the researchers at ' +
      CONFIG.contactEmail + '.',
    '',
    'DATA WE COLLECT',
    'Only the minimum data necessary for the study: your name and email address, which you ' +
      'provide on the next page; optionally your affiliation; your ratings; your written ' +
      'comments; and general profile information (your evaluator role, the material your ' +
      'review drew on, your experience level, and approximate review time). No sensitive ' +
      'personal information is collected.',
    'Your name and email are collected for three declared purposes only: to verify that you ' +
      'meet the eligibility criteria for the evaluator group, to contact you if a technical ' +
      'finding needs clarification, and to identify your data if you ask to withdraw it. ' +
      'They are not used for any other purpose, are not shared with anyone outside the ' +
      'research team, and are never published.',
    '',
    'CONFIDENTIALITY',
    'Your identity is known to the researchers, but it is not published. Responses are ' +
      'reported only in aggregate. No evaluator is identified by name in the manuscript or in ' +
      'any appendix, and individual responses are not disclosed to other participants, to ' +
      'faculty, or to third parties. When responses are exported after collection closes, ' +
      'your name, email, and affiliation are separated from your ratings and held apart from ' +
      'the analysis file, so the data actually analyzed carries no identifier. Both files are ' +
      'stored on a password-protected machine accessible only to the researchers, and are ' +
      'destroyed after the study is completed and defended. This form does not require you to ' +
      'sign in to any account.',
    '',
    'THIRD-PARTY PROCESSORS (DISCLOSED BEFORE CONSENT)',
    'Two third-party services are involved, both operating infrastructure outside the ' +
      "researchers' control:",
    '  • Google Forms — receives and stores your questionnaire responses.',
    '  • Supabase — hosts the demonstration system\'s account records, processing history, and ' +
      'stored compressed results. This applies only if you exercise the deployed system as ' +
      'part of your review.',
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
    'By selecting "I voluntarily consent to take part" below, you confirm that you are at ' +
      'least 18 years old, that you have read and understood this notice, and that you agree ' +
      'to take part. If you do not consent, select the second option and the form will end ' +
      'without recording any evaluation responses.'
  ].join('\n');
}
