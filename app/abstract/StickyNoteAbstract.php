<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class StickyNoteAbstract extends ModelDefaultFunctions
{
    public $sticky_note_id;

    public $professor_id;

    public $user_id;

    public $x;

    public $y;

    public $width;

    public $height;

    public $rotation;

    public $content;

    public $color;

    public $locked;

    public $date_created;

    public $status;
}