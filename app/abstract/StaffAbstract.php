<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class StaffAbstract extends ModelDefaultFunctions
{
    public $staff_id;

    public $department_id;

    public $user_id;

    public $description;

    public $date_created;

    public $status;
}