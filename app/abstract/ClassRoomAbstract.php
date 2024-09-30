<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class ClassRoomAbstract extends ModelDefaultFunctions
{
    public $classroom_id;

    public $classroom_name;

    public $building;
    public $floor;
    public $date_created;

    public $status;


}