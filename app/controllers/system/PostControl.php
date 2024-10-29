<?php

namespace Application\controllers\system;

use Application\controllers\app\EmailControl;
use Application\controllers\app\Response;
use Application\core\Authentication;

class PostControl
{
    public function run($request)
    {
        return $this->$request();
    }

    public function TryAuthenticate()
    {
        $authControl = new Authentication();

        $type = $_POST['type'];
        $data = json_decode($_POST['data'], true);

        return $authControl->TryAuth($type, $data);
    }

    public function DoAuthenticate()
    {
        $authControl = new Authentication();

        $type = $_POST['type'];
        $code = $_POST['code'];
        $user_id = $_POST['user_id'];
        $data = json_decode($_POST['data'], true);

        return $authControl->DoAuth($type, $data, $user_id, $code);
    }

    public function TryRegisterPatient()
    {
        $authControl = new Authentication();

        $data = json_decode($_POST['data'], true);

        return $authControl->RegisterPatient($data);
    }

    public function RequestPreviewPatient()
    {
        $authControl = new Authentication();

        $data = json_decode($_POST['data'], true);

        return $authControl->RegisterPatient($data);
    }

    public function SelectModel()
    {
        global $APPLICATION;

        $id = $_POST['id'];
        $controller = $_POST['controller'];

        return $APPLICATION->FUNCTIONS->{$controller}->get($id, true);
    }

    public function SelectModelByFilter()
    {
        global $APPLICATION;

        $filter = json_decode($_POST["filter"], true);
        $controller = $_POST['controller'];

        return $APPLICATION->FUNCTIONS->{$controller}->filterRecords($filter, true);
    }

    public function SelectModels()
    {
        global $APPLICATION;

        $filter = json_decode($_POST["filter"], true);
        $controller = $_POST['controller'];

        if (empty($filter) || !is_array($filter)) {
            return $APPLICATION->FUNCTIONS->{$controller}->getAllRecords(true);
        }

        return $APPLICATION->FUNCTIONS->{$controller}->filterRecords($filter, true);
    }

    public function SaveStickyNotes()
    {
        global $APPLICATION;
        $stickyNotes = json_decode($_POST['stickyNotes'], true);
        $section_id = $_POST['section_id'];
        $professor_id = $_POST['professor_id'];

        return $APPLICATION->FUNCTIONS->STICKY_NOTE_CONTROL->add($stickyNotes, $section_id, $professor_id);
    }

    public function ImportStudents()
    {
        global $APPLICATION;

        $summary = json_decode($_POST['summary'], true);

        return $APPLICATION->FUNCTIONS->STUDENT_CONTROL->importStudents($summary);
    }

    public function SendVerificationToEmail()
    {
        $email_address = $_POST['email_address'];
        $user_id = $_POST['user_id'];
        $controller = new EmailControl();

        return $controller->sendVerificationInto($user_id, $email_address);
    }

    public function ConfirmAuthenticationVerification()
    {
        $code = $_POST['code'];
        $user_id = $_POST['user_id'];
        $controller = new EmailControl();

        return $controller->confirmVerificationToUser($user_id, $code);
    }

    public function SaveGrades()
    {
        global $APPLICATION;

        $data = json_decode($_POST['data'], true);

        return $APPLICATION->FUNCTIONS->GRADING_PLATFORM_CONTROL->saveGrades($data);
    }
}