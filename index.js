const http = require('http');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

const nodemailer = require('nodemailer');

const pdfMakePrinter = require('pdfmake');
const rootDir = path.resolve(path.dirname('.'));

// Create a SMTP transport object
const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "youremail@gmail.com",
        pass: "yourpassword"
    }
});
console.log('SMTP Configured');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

function createPdf(data) {
    var generateLines = function(lines) {
        console.log('lines: ', lines);
        const tableLines = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            var tmp_line = [
                {
                    text: line.description,
                    margin: [0, 10],
                    margin: [0, 10]
                },
                {
                    text: line.qte,
                    margin: [0, 10],
                    alignment: 'center'
                },
                {
                    text: line.prix_ht,
                    margin: [0, 10],
                    alignment: 'center'
                },
                {
                    text: line.prix_ttc,
                    margin: [0, 10],
                    alignment: 'center'
                }
            ];
            tableLines.push(tmp_line);
        }
        return tableLines;
    }
    console.log('generateLine: ', ...generateLines(data.bill.lines));

    var pdf = {
        pageMargins: [0, 0, 0, 0],
        content: [{ // LOGO + COMPANY INFO
                columns: [
                    {
                        width: 100,
                        image: data.user.logo
                    }, 
                    {
                        text: [
                            `${data.user.phone}\n`,
                            `${data.user.email}\n`,
                            `${data.user.website}\n`,
                            `${data.user.siren}\n`,
                            `${data.user.siret}\n`,
                            `${data.user.rcs}\n`
                        ],
                        width: '*',
                        alignment: 'right'
                    }
                ],
                margin: [30, 50],
            },
            {   // DOCUMENT TITLE
                text: `${data.title}\n`,
                width: '*',
                alignment: 'right',
                bold: true,
                fontSize: 18,
                margin: [0, 0, 20, 0],
            },
            {   // DOCUMENT INFO
                style: 'tableExample',
                table: {
                    widths: ['50%', '50%'],
                    body: [
                        [
                            {
                                alignment: 'left',
                                border: [false, false, false, true],
                                // fillColor: '#eeeeee',
                                text: `${data.user.company_name}\n`,
                                colSpan: 2,
                                fontSize: 22,
                                bold: true,
                                margin: [20, -10, 0, 5],
                            }, {}
                        ],
                        [
                            {
                                fontSize: 11,
                                border: [false, false, false, false],
                                text: 'border:\nundefined',
                                margin: [0, 10, 0, 0],
                                table: {
                                    body: [
                                        [
                                            {
                                                border: [false, false, true, false],
                                                text: 'Facturation',
                                                margin: [0, 0, 20, 0],
                                            },
                                            {
                                                border: [false, false, false, false],
                                                text: [
                                                    `${data.customer.firstname} ${data.customer.lastname}\n`,
                                                    `${data.customer.address}\n`,
                                                    `${data.customer.zip} ${data.customer.city}\n`
                                                ],
                                                margin: [10, 0, 0, 0],
                                            }
                                        ],
                                    ]
                                },
                            },
                            {
                                fontSize: 11,
                                margin: [0, 10, 0, 0],
                                border: [false, false, false, false],
                                columns: [
                                    { width: '*', text: '' },
                                    {
                                        width: 'auto',
                                        table: {
                                            widths: ['auto', 'auto'],
                                            body: [
                                                [
                                                    {
                                                        border: [false, false, true, false],
                                                        text: [
                                                            `Référence ${data.title.toLowerCase()}\n`,
                                                            'Emise le'
                                                        ],
                                                        margin: [0, 0, 10, 0],
                                                    },
                                                    {
                                                        border: [false, false, false, false],
                                                        text: [
                                                            `${data.bill.id}\n`,
                                                            `${data.bill.date}\n`,
                                                        ],
                                                        margin: [10, 0, 0, 0],
                                                    }
                                                ],
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    ]
                }
            },
            {   // TABLE 
                style: 'tableExample',
                table: {
                    widths: ['*', 50, 50, 50],
                    body: [
                        [
                            {fontSize: 12, bold: true, text: 'Description', margin: [0, 15]},
                            {fontSize: 12, bold: true, text: 'Qté', alignment: 'center', margin: [0, 15]},
                            {fontSize: 12, bold: true, text: 'Prix HT', alignment: 'center', margin: [0, 15]},
                            {fontSize: 12, bold: true, text: 'Prix TTC', alignment: 'center', margin: [0, 15]}
                        ],
                        ...generateLines(data.bill.lines),
                        [
                            {
                                width: '*',
                                text: '',
                                border: [false, false, false, false]
                            },
                            {
                                colSpan: 3,
                                width: 'auto',
                                border: [false, false, false, false],
                                table: {
                                    widths: ['50%', '50%'],
                                    body: [
                                        [
                                            {
                                                border: [false, false, false, false],
                                                text: 'Prix HT:'
                                            },
                                            {
                                                border: [false, false, false, false],
                                                text: '100€'
                                            }
                                        ],
                                        [
                                            {
                                                border: [false, false, false, false],
                                                text: 'Prix TTC:'
                                            },
                                            {
                                                border: [false, false, false, false],
                                                text: '110€'
                                            }
                                        ],
                                        [
                                            {
                                                border: [false, false, false, false],
                                                text: 'A PAYER:',
                                                bold: true,
                                                fontSize: 15,
                                            },
                                            {
                                                border: [false, false, false, false],
                                                text: '110€',
                                                bold: true,
                                                fontSize: 15,
                                            }
                                        ]
                                    ]
                                }
                            },
                            {},
                            {}
                        ]
                    ]
                }
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10]
            },
            subheader: {
                fontSize: 16,
                bold: true,
                margin: [0, 10, 0, 5]
            },
            tableExample: {
                margin: [0, 5, 0, 15]
            },
            tableHeader: {
                bold: true,
                fontSize: 13,
                color: 'black'
            }
        },
        defaultStyle: {
            // alignment: 'justify'
        }
    };
    return pdf;
}

function createDoc(pdf) {
    var fontDescriptors = {
        Roboto: {
          normal: path.join(__dirname, '/fonts/Roboto-Regular.ttf'),
          bold: path.join(__dirname, '/fonts/Roboto-Medium.ttf'),
          italics: path.join(__dirname, '/fonts/Roboto-Italic.ttf'),
          bolditalics: path.join(__dirname, '/fonts/Roboto-MediumItalic.ttf')
        }
    };
    
    var printer = new pdfMakePrinter(fontDescriptors);    
    var doc = printer.createPdfKitDocument(pdf);
    return doc;
}

function createPdfBinary(pdf, callback) {

  var doc = createDoc(pdf);

  var chunks = [];
  var result;

  doc.on('data', function (chunk) {
    chunks.push(chunk);
  });
  doc.on('end', function () {
    result = Buffer.concat(chunks);
    callback(result);
  });
  doc.end();

}


app.post('/pdf', function (req, res) {

    var data = req.body;
    // console.log(data.bill.lines);
    // console.log('////////////////////////////');

    var docDefinition = createPdf(data);

    createPdfBinary(docDefinition, function (binary) {
        console.log('PDF CREATED')
        res.contentType('application/pdf');
        res.send(binary);
    }, function (error) {
        res.send('ERROR:' + error);
    });

});

app.post('/mailer', function(req, res) {
    var data = req.body;
    var pdfDoc = createDoc(createPdf(data));
    pdfDoc.end();

    // Message object
    var message = {
        // sender info
        from: `${data.user.company_name} <${data.user.email}>`,
        // Comma separated list of recipients
        to: `"${data.customer.firstname} ${data.customer.lastname}"  <${data.customer.email}>`,
        // Subject of the message
        subject: `${data.title} ${data.user.company_name}`, 
        // HTML body
        html:`<p><b>Bonjour</b> ${data.customer.firstname} ${data.customer.lastname}</p>`+
            `<p>Vous trouverez votre ${data.title} ci-joint,<br>Cordialement,<br>${data.user.company_name}</p>`,
        attachments: {
            filename: `${data.title}-${data.bill.id}.pdf`,
            content: pdfDoc
        }
    };

    console.log('Sending Mail');
    transport.sendMail(message, function(error){
        if(error){
            console.log('Error occured');
            console.log(error.message);
            return;
        }
        console.log('Message sent successfully!');
        res.json({message: 'Message sent successfully!'});

        // if you don't want to use this transport object anymore, uncomment following line
        transport.close(); // close the connection pool
    });
});




var server = http.createServer(app);
var port = process.env.PORT || 1234;
server.listen(port);

console.log('http server listening on %d', port);