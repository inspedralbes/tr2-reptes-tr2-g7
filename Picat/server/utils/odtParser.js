const AdmZip = require('adm-zip');
const xml2js = require('xml2js');

const extractOdtText = async (buffer) => {
    try {
        const zip = new AdmZip(buffer);
        const contentXml = zip.readAsText('content.xml');

        if (!contentXml) {
            throw new Error('Invalid ODT file: content.xml not found');
        }

        const parser = new xml2js.Parser();
        const result = await parser.parseStringPromise(contentXml);

        let text = '';

        // Recursive function to traverse the XML object and find text:p tags
        const traverse = (obj) => {
            if (typeof obj === 'object') {
                for (let key in obj) {
                    if (key === 'text:p') {
                        // Found paragraph(s)
                        const paragraphs = obj[key];
                        if (Array.isArray(paragraphs)) {
                            paragraphs.forEach(p => {
                                if (typeof p === 'string') {
                                    text += p + '\n';
                                } else if (typeof p === 'object' && p._) {
                                    text += p._ + '\n';
                                } else {
                                    // Complex paragraph content (spans etc), try to just JSON stringify or drill down
                                    // For simplicity in this timeframe, let's try to get simple text
                                    // ODT text structure can be complex with styles
                                    // Let's use a simpler check: usually text content is in _ or pure strings in arrays
                                    if (p['_']) text += p['_'] + '\n';
                                    // If it has children like text:span
                                }
                            });
                        }
                    } else {
                        traverse(obj[key]);
                    }
                }
            } else if (Array.isArray(obj)) {
                obj.forEach(item => traverse(item));
            }
        };

        // Better strategy for XML2JS ODT:
        // The body is usually under result['office:document-content']['office:body'][0]['office:text'][0]
        // We can just regex the content.xml for simplicity if structure is too nested, 
        // but let's try a robust-enough deep traverse or specific path.

        const body = result?.['office:document-content']?.['office:body']?.[0]?.['office:text']?.[0];
        if (body) {
            // Let's iterate over text:p directly if possible
            if (body['text:p']) {
                body['text:p'].forEach(p => {
                    // p might be a string or object
                    if (typeof p === 'string') text += p + '\n';
                    else if (p._) text += p._ + '\n';
                });
            }
            // Also headers text:h
            if (body['text:h']) {
                body['text:h'].forEach(h => {
                    if (typeof h === 'string') text += h + '\n';
                    else if (h._) text += h._ + '\n';
                });
            }
        }

        // Fallback: Crude Regex on XML string if parsing yielded nothing (safer for "all text")
        if (!text) {
            return contentXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }

        return text;
    } catch (error) {
        console.error('ODT Parsing Error:', error);
        throw new Error('Failed to parse ODT file');
    }
};

module.exports = extractOdtText;
