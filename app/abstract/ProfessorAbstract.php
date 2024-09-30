<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ProfessorAbstract extends ModelDefaultFunctions
{
    public $professor_id;

    public $main_course_id;


    public $user_id;

    public $description;

    public $date_created;

    public $status;
}