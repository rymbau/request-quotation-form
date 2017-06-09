<?php
include('vendor/autoload.php');

use Monolog\Logger;
use Monolog\Handler\RotatingFileHandler;

// create a log channel
$log = new Logger('name');
$log->pushHandler(new RotatingFileHandler('../../../log/request-quotation-form.log',7));    //keep logs 7 days

$mail = new PHPMailer;

$mail->isSMTP();
$mail->Host       = isset($_SERVER['SMTP_HOST']) ? $_SERVER['SMTP_HOST'] : getenv('SMTP_HOST');
$mail->Username   = isset($_SERVER['SMTP_USERNAME']) ? $_SERVER['SMTP_USERNAME'] : getenv('SMTP_USERNAME');
$mail->Password   = isset($_SERVER['SMTP_PASSWORD']) ? $_SERVER['SMTP_PASSWORD'] : getenv('SMTP_PASSWORD');
$mail->SMTPAuth   = true;
$mail->SMTPSecure = 'ssl';
$mail->Port       = 465;
$mail->Timeout    = 10;
$mail->CharSet    = 'utf-8';

$mail->setFrom($_REQUEST['E-mail'], $_REQUEST['Nom']);
$mail->addAddress('emmanuel.roecker@glicer.com', 'Emmanuel ROECKER');
$mail->addAddress('rym.bouchagour@glicer.com', 'Rym BOUCHAGOUR');

$mail->isHTML(true);

$mail->Subject = $_REQUEST['Intitulé'];
$mail->Body    = 'Description : ' . $_REQUEST['Description'] . '<br>Objectifs : ' . $_REQUEST['Objectifs'];

$log->warning(var_export($_FILES, true));

$files = $_FILES["Documents"];

$attachmentFiles = [];
foreach($files["error"] as $index => $error) {
    $log->warning($error);
    if ($error == UPLOAD_ERR_OK) {
        $tmp_name = $files["tmp_name"][$index];
        $name     = $files["name"][$index];
        $log->warning($tmp_name . " " . file_exists($tmp_name) . " " . $name);

        $attachmentFile = "../../../data/mail/$name";
        move_uploaded_file($tmp_name, $attachmentFile);
        $mail->addAttachment($attachmentFile);
        
        $attachmentFiles[] = $attachmentFile;
    }
} 

if (!$mail->send()) {
    echo 'Message could not be sent.';
} else {
    echo 'Message has been sent.';
}

foreach ($attachmentFiles as $filename) {
    unlink($filename);
}
