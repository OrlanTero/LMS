<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class UserAbstract extends ModelDefaultFunctions
{
    public $user_id;

    public $no;

    public $firstname;
    public $lastname;

    public $email;
    public $phone;

    public $image;
    public $user_type;
    public $date_created;

    public $displayName;

    public $status;


}