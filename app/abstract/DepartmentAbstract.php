<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class DepartmentAbstract extends ModelDefaultFunctions
{
    public $department_id;

    public $department_name;

    public $head;

    public $date_created;

    public $status;
}