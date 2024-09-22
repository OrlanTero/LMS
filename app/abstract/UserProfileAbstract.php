<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class UserProfileAbstract extends ModelDefaultFunctions
{
    public $id;

    public $name;

    public $description;

    public $owner;

    public $address;

    public $tell_no;

    public $tin;

    public $email;

    public $company_logo;

    public $main_logo;


    public $year;

    public $period;

    public $db_status;

}