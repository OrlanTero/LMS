<?php

namespace Application\core;

use Application\controllers\app\EmailControl;
use Application\controllers\app\Response;


class Authentication
{
    protected $CONNECTION;
    /**
     * @type Connection
     */
    protected $APPLICATION;
    /**
     * @type Session
     */
    protected $SESSION;

    public function __construct()
    {
        global $CONNECTION;
        global $APPLICATION;
        global $SESSION;


        $this->CONNECTION = $CONNECTION;
        $this->APPLICATION = $APPLICATION;
        $this->SESSION = $SESSION;
    }

    public function TryAuth($type, $data)
    {
        $data['user_type'] = $type;

        $control = $this->APPLICATION->FUNCTIONS->USER_CONTROL;

        $data["password"] = md5($data['password']);

        $exists = $control->alreadyExists($data);

        if ($exists->code === 200) {
            $user = $exists->body['id'];
            $user = $control->get($user, true);

            $send = $this->SendVerification($user->user_id, $user->email);

            if ($send) {
                return new Response(200, "Successfully Login!", ["user" => $user]);
            } else {
                return new Response(203, "Success but Unable to sent Email!");
            }
        }

        return new Response(204, "Auth Failed!");
    }

    public function SendVerification($user_id, $email_address)
    {
        $controller = new EmailControl();

        return $controller->sendVerificationInto($user_id, $email_address);
    }

    public function ConfirmVerification($user_id, $code)
    {
        $controller = new EmailControl();

        return $controller->confirmVerificationToUser($user_id, $code);
    }

    public function LoginWithAuth($type, $data)
    {
        global $APPLICATION;

        $data['user_type'] = $type;

        $control = $this->APPLICATION->FUNCTIONS->USER_CONTROL;

        $data["password"] = md5($data['password']);
        
        $exists = $control->alreadyExists($data);

        if ($exists->code === 200) {
            $user = $exists->body['id'];
            $user = $control->get($user, true);

            $this->SESSION->apply($user);
            $this->SESSION->start();

            return  new Response(200, "Successfully Login!", ["user" => $user]);
        }

        return new Response(204, "Login Failed!", ["errors" => ["password"]]);
    }

    public function IsUsernameExists($username)
    {
        return count($this->APPLICATION->FUNCTIONS->USER_CONTROL->filterRecords(["username" => $username], false)) > 0;
    }

    public function IsEmailExists($email)
    {
        return count($this->APPLICATION->FUNCTIONS->USER_CONTROL->filterRecords(["email_address" => $email], false)) > 0;
    }

    public function RegisterPatient(mixed $data)
    {
        $control = $this->APPLICATION->FUNCTIONS->USER_CONTROL;

        $usernameExists = $this->IsUsernameExists($data['username']);

        if ($usernameExists) {
            return new Response(403, "Username Already Exists!");
        }

        if ($this->IsEmailExists($data['email_address'])) {
            return new Response(403, "Email Address Already Exists!");
        }

        $data['user_type'] = 1;

        return $control->AddRecord($data);
    }

    public function DoAuth(mixed $type, mixed $data, mixed $user_id, mixed $code)
    {
        $confirm = $this->ConfirmVerification($user_id, $code);

        if ($confirm) {
            return $this->LoginWithAuth($type, $data);
        }

        return  new Response(400, "Failed to Authenticate!");
    }
}