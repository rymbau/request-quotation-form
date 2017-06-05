<?php
include('vendor/autoload.php');

use Monolog\Logger;
use Monolog\Handler\RotatingFileHandler;

// create a log channel
$log = new Logger('name');
$log->pushHandler(new RotatingFileHandler('../../../log/request-quotation-form.log'));

$mail = new PHPMailer;

$mail->isSMTP();
$mail->Host       = $_SERVER['SMTP_HOST'];
$mail->SMTPAuth   = true;
$mail->Username   = $_SERVER['SMTP_USERNAME'];
$mail->Password   = $_SERVER['SMTP_PASSWORD'];
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

$file = $_FILES["Documents"];

$log->warning($file['error']);

$attachmentFile = null;
if ($file['error'] == UPLOAD_ERR_OK) {
    $tmp_name = $file["tmp_name"];
    $name     = $file["name"];
    $log->warning($tmp_name . " " . file_exists($tmp_name));

    $attachmentFile = "../../../data/mail/$name";
    move_uploaded_file($tmp_name, $attachmentFile);
    $mail->addAttachment($attachmentFile);
}

if (!$mail->send()) {
    echo 'Message could not be sent.';
} else {
    echo 'Message has been sent.';
}

if ($attachmentFile) {
    unlink($attachmentFile);
}
